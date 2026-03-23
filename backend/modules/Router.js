import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketServer } from "socket.io";

import Auth from "./auth/Auth.js";
import ChatBot from "./chatbot/ChatBot.js";
import RateLimit from "./ratelimit/RateLimit.js";
import Session from "./sessions/Session.js";
import User from "./users/User.js";

const ONE_SECOND_MS = 1000;
const TEN_SECONDS_MS = 10 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_SETTINGS_UPDATES_PER_HOUR = 100;

class Router {
	constructor(port = 3435) {
		this.PORT = port;
		this.app = express();
		this.router = express.Router();
		this.apiRouter = express.Router();
		this.io = null;

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		this.frontendPath = path.join(__dirname, "../../frontend");
	}

	initApi() {
		this.apiRouter.post("/send-chatbot-message", async (req, res) => {
			const maxMessages = req.session ? 50 : 5;
			const scopeKey = req.session
				? `chatbot:user:${req.session.userId}`
				: `chatbot:ip:${req.ip}`;

			const existing = RateLimit.get(scopeKey);
			if (existing) {
				const currentCount = Number(existing.value?.count || 0);
				if (currentCount >= maxMessages) {
					const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - Date.now()) / 1000));
					return res.json({ response: `Rate limit exceeded. Try again later (${retryAfterSeconds} seconds).` });
				}

				RateLimit.set(scopeKey, { count: currentCount + 1 }, Math.max(1, existing.expiresAt - Date.now()));
			} else {
				RateLimit.set(scopeKey, { count: 1 }, ONE_HOUR_MS);
			}

			const { message } = req.body;
			const chatbotResponse = await ChatBot.respond(message);
			res.json({ response: chatbotResponse });
		});

		this.apiRouter.get("/user", async (req, res) => {
			if (!req.session.userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const rateLimitKey = `user:get:${req.session.userId}`;
			if (RateLimit.get(rateLimitKey)) {
				return res.status(429).json({ error: "Rate limited. Please wait 1 second." });
			}
			RateLimit.set(rateLimitKey, true, ONE_SECOND_MS);

			const user = await User.getById(req.session.userId);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			delete user.password;
			delete user.ipId;

			res.json({ user });
		});

		this.apiRouter.post("/register", async (req, res) => {
			if (req.session) {
				return res.status(400).json({ error: "Already logged in" });
			}

			const rateLimitKey = `register:ip:${req.ip}`;
			if (RateLimit.get(rateLimitKey)) {
				return res.status(429).json({ error: "Rate limited. Please wait 10 seconds." });
			}
			RateLimit.set(rateLimitKey, true, TEN_SECONDS_MS);

			const { username, email, password } = req.body;
			const result = await Auth.register({ username, email, password, ip: req.ip });
			if (result.error) {
				return res.status(result.status).json({ error: result.error });
			}
			res.json(result);
		});

		this.apiRouter.post("/login", async (req, res) => {
			if (req.session) {
				return res.status(400).json({ error: "Already logged in" });
			}

			const rateLimitKey = `login:ip:${req.ip}`;
			if (RateLimit.get(rateLimitKey)) {
				return res.status(429).json({ error: "Rate limited. Please wait 10 seconds." });
			}
			RateLimit.set(rateLimitKey, true, TEN_SECONDS_MS);

			const { email, password } = req.body;
			const result = await Auth.login({ email, password, ip: req.ip });
			if (result.error) {
				return res.status(result.status).json({ error: result.error });
			}
			res.json(result);
		});

		this.apiRouter.post("/logout", async (req, res) => {
			if (!req.session.userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}
			await Session.deleteById(req.session.id);
			res.json({ success: true });
		});

		this.apiRouter.post("/update-settings", async (req, res) => {
			if (!req.session.userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const rateLimitKey = `settings:update:${req.session.userId}`;
			const existing = RateLimit.get(rateLimitKey);
			if (existing) {
				const currentCount = Number(existing.value?.count || 0);
				if (currentCount >= MAX_SETTINGS_UPDATES_PER_HOUR) {
					const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - Date.now()) / 1000));
					return res.status(429).json({
						error: `Rate limited. You can update settings ${MAX_SETTINGS_UPDATES_PER_HOUR} times per hour.`,
						retryAfterSeconds
					});
				}

				RateLimit.set(rateLimitKey, { count: currentCount + 1 }, Math.max(1, existing.expiresAt - Date.now()));
			} else {
				RateLimit.set(rateLimitKey, { count: 1 }, ONE_HOUR_MS);
			}

			const { key, value } = req.body;
			const user = await User.getById(req.session.userId);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			return await User.changeSetting(user.id, key, value)
				.then(() => res.json({ success: true }))
				.catch(err => res.status(400).json({ error: err.message }));
		});

		this.app.use(async (req, res, next) => {
			const authHeader = req.headers.authorization;
			const sessionId = typeof authHeader === "string" ? authHeader : null;
			if (sessionId) {
				const session = await Session.getById(sessionId);
				if (session) {
					req.session = session;
				}
			}
			next();
		});

		this.app.use("/api", this.apiRouter);
	}

	// Strip zalgo / combining unicode characters
	static #stripZalgo(text) {
		return text
			.normalize("NFC")
			.replace(/\p{M}/gu, "");
	}

	static #sanitizeMessage(text) {
		if (typeof text !== "string") { return null; }
		const cleaned = Router.#stripZalgo(text).trim();
		if (cleaned.length === 0 || cleaned.length > 1024) { return null; }
		return cleaned;
	}

	initGateway(server) {
		this.io = new SocketServer(server, {
			path: "/gateway",
			cors: {
				origin: "*"
			}
		});

		this.io.use(async (socket, next) => {
			const authToken = socket.handshake.auth?.token;
			const headerToken = socket.handshake.headers?.authorization;
			const rawToken = authToken || headerToken;
			const sessionId = typeof rawToken === "string"
				? rawToken
				: null;

			if (!sessionId) {
				return next(new Error("Unauthorized"));
			}

			const session = await Session.getById(sessionId);
			if (!session) {
				return next(new Error("Unauthorized"));
			}

			socket.session = session;
			socket.user = session.user;
			next();
		});

		this.io.on("connection", (socket) => {
			socket.emit("gateway:connected", {
				success: true,
				userId: socket.session?.userId
			});

			socket.on("chat:message", (data) => {
				const messageRateLimitKey = `socket:chat:${socket.session.userId}`;
				if (RateLimit.get(messageRateLimitKey)) {
					return socket.emit("chat:error", {
						error: "Rate limited. Please wait 1 second before sending another message."
					});
				}
				RateLimit.set(messageRateLimitKey, true, ONE_SECOND_MS);

				const raw = typeof data === "object" ? data?.message : data;
				const message = Router.#sanitizeMessage(raw);

				if (!message) {
					return socket.emit("chat:error", {
						error: "Invalid message. Must be between 1 and 1024 characters and contain no zalgo text."
					});
				}

				const username = socket.user?.username ?? "Unknown";

				this.io.emit("chat:message", {
					userId: socket.session.userId,
					username,
					message,
					color: socket.user?.settings?.usernameColor,
					timestamp: Date.now()
				});
			});
		});
	}

	init() {
		this.app.use(express.json());

		this.initApi();

		this.router.get("/", (req, res) => {
			res.sendFile(path.join(this.frontendPath, "index.html"));
		});

		this.router.get("/:page", (req, res, next) => {
			if (path.extname(req.path)) {
				return next();
			}
			const page = req.params.page;
			console.log(page);
			res.redirect(`/?page=${page}`);
		});

		this.app.use("/", this.router);
		this.app.use(express.static(this.frontendPath));

		const server = this.app.listen(this.PORT, () => {
			console.log(`Server listening on port https://localhost:${this.PORT}`);
		});

		this.initGateway(server);
	}
}

export default Router;

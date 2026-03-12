import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import ChatBot from "./chatbot/ChatBot.js";
import Session from "./sessions/Session.js";
import User from "./users/User.js";

class Router {
	constructor(port = 3435) {
		this.PORT = port;
		this.app = express();
		this.router = express.Router();
		this.apiRouter = express.Router();

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		this.frontendPath = path.join(__dirname, "../../frontend");
	}

	initApi() {
		this.apiRouter.post("/sendchatbotmessage", async (req, res) => {
			const { message } = req.body;
			const chatbotResponse = await ChatBot.respond(message);
			res.json({ response: chatbotResponse });
		});

		this.apiRouter.get("/user", async (req, res) => {
			if (!req.session) {
				return res.status(401).json({ error: "Unauthorized" });
			}
			const user = await User.getById(req.session.userId);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			delete user.password;

			res.json({ user });
		});

		this.app.use("/api", this.apiRouter);
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

		this.app.use(async (req, res, next) => {
			const sessionId = req.headers["x-session-id"];
			if (sessionId) {
				const session = await Session.getById(sessionId);
				if (session) {
					req.session = session;
				}
			}
			next();
		});

		this.app.use("/", this.router);
		this.app.use(express.static(this.frontendPath));

		this.app.listen(this.PORT, () => {
			console.log(`Server listening on port https://localhost:${this.PORT}`);
		});
	}
}

export default Router;

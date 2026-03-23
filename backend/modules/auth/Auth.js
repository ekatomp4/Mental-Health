import bcrypt from "bcrypt";

import Session from "../sessions/Session";
import User from "../users/User";

class Auth {
	static async register({ username, email, password, ip }) {
		if (!username || !email || !password) {
			return {
				error: "Username, email, and password are required.",
				status: 400
			};
		}

		if (await User.getByUsername(username)) {
			return {
				error: "Username is already in use.",
				status: 409
			};
		}

		if (await User.getByEmail(email)) {
			return {
				error: "Email is already in use.",
				status: 409
			};
		}

		const user = await User.create({ username, email, password, ip });

		if (!user) {
			return {
				error: "Unable to create user.",
				status: 400
			};
		}

		const session = await Session.create(user.id, ip);

		return {
			token: session.id
		};
	}

	static async login({ email, password, ip }) {
		if (!email || !password) {
			return {
				error: "Email and password are required.",
				status: 400
			};
		}

		const user = await User.getByEmail(email);

		if (!user) {
			return {
				error: "Invalid email or password.",
				status: 401
			};
		}

		const passwordMatches = await bcrypt.compare(password, user.password);

		if (!passwordMatches) {
			return {
				error: "Invalid email or password.",
				status: 401
			};
		}

		const session = await Session.create(user.id, ip);

		return {
			token: session.id
		};
	}

	static async logout(sessionId) {
		if (!sessionId || typeof sessionId !== "string") {
			return null;
		}

		return Session.deleteById(sessionId);
	}
}

export default Auth;

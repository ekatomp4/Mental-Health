import bcrypt from "bcrypt";

import prisma from "../prisma";
import IPs from "../ips/IPs";

const USERNAME_COLORS = new Set([
	"RED",
	"ORANGE",
	"YELLOW",
	"GREEN",
	"BLUE",
	"PURPLE",
	"BLACK"
]);

class User {
	static async getById(id) {
		if (!id || typeof id !== "string") {
			return null;
		}

		return await prisma.user.findUnique({
			where: { id },
			include: {
				settings: true
			}
		});
	}

	static async getByEmail(email) {
		if (!email || typeof email !== "string") {
			return null;
		}

		return await prisma.user.findUnique({
			where: { email: email.toLowerCase() }
		});
	}

	static async getByUsername(username) {
		if (!username || typeof username !== "string") {
			return null;
		}

		return await prisma.user.findFirst({
			where: {
				username: {
					equals: username,
					mode: "insensitive"
				}
			}
		});
	}

	static async create({ username, email, password, ip }) {
		if (!username || !email || !password) {
			return null;
		}

		const passwordHash = await bcrypt.hash(password, 10);

		return await prisma.$transaction(async (prisma) => {
			const ipAddress = await IPs.getOrCreate(ip);
			if (!ipAddress) {
				return null;
			}

			const user = await prisma.user.create({
				data: {
					username,
					email: email.toLowerCase(),
					password: passwordHash,
					ipId: ipAddress.id
				}
			});

			await prisma.userSetting.create({
				data: {
					userId: user.id
				}
			});

			return user;
		});
	}

	static async deleteById(id) {
		if (!id || typeof id !== "string") {
			return null;
		}

		try {
			return await prisma.user.delete({
				where: { id }
			});
		} catch (error) {
			if (error?.code === "P2025") {
				return null;
			}

			throw error;
		}
	}

	static async changeSetting(userId, settingKey, settingValue) {
		const validSettings = {
			signedUpForNewsletter: "boolean",
			usernameColor: "string"
		};

		if (!validSettings[settingKey]) {
			throw new Error("Invalid setting key");
		}

		if (typeof settingValue !== validSettings[settingKey]) {
			throw new Error("Invalid setting value type");
		}

		if (settingKey === "usernameColor" && !USERNAME_COLORS.has(settingValue)) {
			throw new Error("Invalid username color");
		}

		const user = await this.getById(userId);
		if (!user) {
			throw new Error("User not found");
		}

		return await prisma.userSetting.update({
			where: { userId },
			data: { [settingKey]: settingValue }
		});
	}
}

export default User;

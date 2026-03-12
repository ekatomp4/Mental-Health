import bcrypt from "bcrypt";

import prisma from "../../prisma";

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

	static async create({ username, email, password }) {
		if (!username || !email || !password) {
			return null;
		}

		const passwordHash = await bcrypt.hash(password, 10);

		return await prisma.$transaction(async (prisma) => {
			const user = await prisma.user.create({
				data: {
					username,
					email,
					password: passwordHash
				}
			});

			await prisma.userSettings.create({
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
}

export default User;

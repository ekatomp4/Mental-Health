import prisma from "../../prisma";

class Session {
	static async create(userId) {
		if (!userId || typeof userId !== "string") {
			return null;
		}

		return prisma.session.create({
			data: {
				userId
			}
		});
	}

	static async getById(id) {
		if (!id || typeof id !== "string") {
			return null;
		}

		return prisma.session.findUnique({
			where: { id },
			include: {
				user: true
			}
		});
	}

	static async deleteById(id) {
		if (!id || typeof id !== "string") {
			return null;
		}

		return prisma.session.delete({
			where: { id }
		});
	}
}

export default Session;

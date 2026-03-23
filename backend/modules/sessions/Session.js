import prisma from "../prisma";
import IPs from "../ips/IPs";

class Session {
	static async create(userId, ip) {
		if (!userId || typeof userId !== "string") {
			return null;
		}

		const ipAddress = await IPs.getOrCreate(ip);
		if (!ipAddress) {
			return null;
		}

		return prisma.session.create({
			data: {
				userId,
				ipId: ipAddress.id,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
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
				user: {
					include: {
						settings: true
					}
				}
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

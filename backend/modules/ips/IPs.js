import prisma from "../prisma";

class IPs {
	static async getById(id) {
		if (!id || typeof id !== "string") {
			return null;
		}

		return await prisma.iP.findUnique({
			where: { id }
		});
	}

	static async getByAddress(address) {
		if (!address || typeof address !== "string") {
			return null;
		}

		return await prisma.iP.findUnique({
			where: { address }
		});
	}

	static async getOrCreate(address) {
		if (!address || typeof address !== "string") {
			return null;
		}

		return await prisma.iP.upsert({
			where: { address },
			update: {},
			create: { address }
		});
	}

	static async create(address) {
		if (!address || typeof address !== "string") {
			return null;
		}

		const existing = await this.getByAddress(address);
		if (existing) {
			return existing;
		}

		try {
			return await prisma.iP.create({
				data: { address }
			});
		} catch (error) {
			if (error?.code === "P2002") {
				return null; // already exists
			}

			throw error;
		}
	}
}

export default IPs;

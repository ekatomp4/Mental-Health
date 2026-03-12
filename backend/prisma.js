import { PrismaClient } from "./prisma/generated/client.js";

export const prisma = new PrismaClient();

export default prisma;

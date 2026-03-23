import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../../prisma/generated/client.ts";
import { config } from "dotenv";

config({
	path: process.env.NODE_ENV === "prod" ? ".env.prod" : ".env.dev"
});

const connectionString = `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?schema=public`;
const adapter = new PrismaPg(new Pool({ connectionString }));

export const prisma = new PrismaClient({ adapter });

export default prisma;

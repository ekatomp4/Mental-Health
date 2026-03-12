import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

config({
	path: process.env.NODE_ENV === "prod" ? ".env.prod" : ".env.dev"
});

export default defineConfig({
	schema: "prisma/schema.prisma",
	datasource: {
		url: `postgresql://${env("DATABASE_USER")}:${env("DATABASE_PASSWORD")}@${env("DATABASE_HOST")}:${env("DATABASE_PORT")}/${env("DATABASE_NAME")}?schema=public`
	}
});

// @ts-nocheck

import { defineConfig } from "drizzle-kit";

const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DB_ID, CLOUDFLARE_D1_TOKEN } =
	process.env;

export default defineConfig({
	dialect: "sqlite",
	driver: "d1-http",
	out: "drizzle",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		accountId: CLOUDFLARE_ACCOUNT_ID!,
		databaseId: CLOUDFLARE_DB_ID!,
		token: CLOUDFLARE_D1_TOKEN!,
	},
});

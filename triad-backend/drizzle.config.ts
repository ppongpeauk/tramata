// @ts-nocheck

import { defineConfig } from "drizzle-kit";

const { CF_ACCOUNT_ID, CF_DB_ID, CF_D1_TOKEN } = process.env;

export default defineConfig({
	dialect: "sqlite",
	driver: "d1-http",
	out: "drizzle",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		accountId: CF_ACCOUNT_ID!,
		databaseId: CF_DB_ID!,
		token: CF_D1_TOKEN!,
	},
});

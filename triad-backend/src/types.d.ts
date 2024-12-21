import { DrizzleD1Database } from "drizzle-orm/d1";
import { Context } from "hono";
import * as schema from "@/db/schema";

export type GenericHono = {
	Variables: {
		db: DrizzleD1Database<typeof schema>;
	};
	Bindings: {
		WMATA_API_PRIMARY_KEY: string;
		WMATA_API_SECONDARY_KEY: string;
		DB: D1Database;
	};
};
export type ContextHono = Context<GenericHono>;

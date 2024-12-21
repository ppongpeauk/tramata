import { Next } from "hono";
import { ContextHono } from "./types";
import { wmataApi } from "./utils/web";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

/**
 * Middleware to set up the WMATA API key
 */
export const axiosMiddleware = async (c: ContextHono, next: Next) => {
	wmataApi.defaults.headers.common["api_key"] = c.env.WMATA_API_PRIMARY_KEY;
	await next();
};

/**
 * Middleware to set up the database
 */
export const dbMiddleware = async (c: ContextHono, next: Next) => {
	const db = drizzle(c.env.DB, { schema });
	c.set("db", db);
	await next();
};

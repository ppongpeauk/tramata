import { Next } from "hono";
import { ContextHono } from "./types";
import { wmataApi } from "./utils/web";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { TrainData } from "./durableObjects/websocket";

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

/**
 * Middleware to set up the train data
 */
export const trainDataMiddleware = async (c: ContextHono, next: Next) => {
	const id = c.env.TRAIN_DATA.idFromName("default");
	const stub = c.env.TRAIN_DATA.get(id);
	c.set("trainDataStub", stub);
	await next();
};

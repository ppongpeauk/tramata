import { ContextHono } from "@/types";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const TTL_DEFAULT = 60 * 60 * 24; // 1 day
const TTL_MAX = 60 * 60 * 24 * 30; // 30 days

/**
 * Get a value from the cache.
 * @param ctx - The context object.
 * @param key - The key to get the value for.
 * @param useKV - Whether to use the KV store instead of the database.
 * @returns The cached value or null if it doesn't exist.
 */
export async function getCachedObject(
	ctx: ContextHono,
	key: string,
	type: "text" | "json" | "arrayBuffer" | "stream" = "text"
) {
	const kv = ctx.env.KV;
	const cache = await kv.get(key, type as any);

	if (cache) {
		console.debug(`[Cache] Using cached ${key}.`);
	}

	return !!cache ? JSON.parse(cache) : null;
}

/**
 * Set a value in the cache.
 * @param ctx - The context object.
 * @param key - The key to set the value for.
 * @param data - The data to set.
 * @param ttl - The time to live for the cache in seconds.
 */
export async function setCachedObject(
	ctx: ContextHono,
	key: string,
	data: any,
	ttl = TTL_DEFAULT,
	expiration?: number
) {
	const kv = ctx.env.KV;
	await kv.put(key, JSON.stringify(data), {
		expirationTtl: ttl,
		expiration,
	});
	return;
}

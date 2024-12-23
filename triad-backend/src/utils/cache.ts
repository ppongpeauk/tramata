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
	useKV: boolean = false
) {
	if (useKV) {
		const kv = ctx.env.KV;
		const cache = await kv.get(key);
		if (!cache) {
			return null;
		}
		return cache;
	}
	const db = ctx.get("db");
	const cache = await db.query.cachedObjects.findFirst({
		where: eq(schema.cachedObjects.key, key),
	});
	if (!cache) {
		return null;
	}
	if (new Date(cache.updateAfter || "") < new Date()) {
		await db
			.delete(schema.cachedObjects)
			.where(eq(schema.cachedObjects.key, key));
		return null;
	}

	return cache.data;
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
	useKV = false
) {
	if (useKV) {
		const kv = ctx.env.KV;
		await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
		return;
	}

	const db = ctx.get("db");

	await db
		.insert(schema.cachedObjects)
		.values({
			key,
			data,
			updateAfter: new Date(Date.now() + ttl * 1000).toISOString(),
		})
		.onConflictDoUpdate({
			target: [schema.cachedObjects.key],
			set: {
				data,
				updateAfter: new Date(Date.now() + ttl * 1000).toISOString(),
			},
		});
}

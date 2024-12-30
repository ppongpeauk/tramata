import { DrizzleD1Database } from "drizzle-orm/d1";
import { Context } from "hono";
import * as schema from "@/db/schema";
import { TrainData } from "./durableObjects/websocket";
import type { DurableObjectStub } from "cloudflare:workers";

export type GenericHono = {
	Variables: {
		db: DrizzleD1Database<typeof schema>;
		trainDataStub: DurableObjectStub<TrainData>;
	};
	Bindings: {
		WMATA_API_PRIMARY_KEY: string;
		WMATA_API_SECONDARY_KEY: string;
		CLOUDFLARE_ACCOUNT_ID: string;
		CLOUDFLARE_DB_ID: string;
		CLOUDFLARE_D1_TOKEN: string;
		DB: D1Database;
		TRAIN_DATA: DurableObjectNamespace<TrainData>;
		KV: KVNamespace;
	};
};
export type ContextHono = Context<GenericHono>;

export type EventData = {
	type: "connection" | "data";
	data: any;
};

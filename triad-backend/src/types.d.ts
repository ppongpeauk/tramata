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
		DB: D1Database;
		TRAIN_DATA: DurableObjectNamespace<TrainData>;
	};
};
export type ContextHono = Context<GenericHono>;

export type EventData = {
	type: "connection" | "data";
	data: any;
};

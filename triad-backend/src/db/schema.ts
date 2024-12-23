import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const lines = sqliteTable("lines", {
	lineCode: text("line_code").primaryKey(),
	displayName: text("display_name"),

	startStationCode: text("start_station_code"),
	endStationCode: text("end_station_code"),

	internalDestination1: text("internal_destination_1"),
	internalDestination2: text("internal_destination_2"),

	updateAfter: text("update_after").default(sql`(current_timestamp)`),
});

export const stations = sqliteTable("stations", {
	code: text("code").primaryKey(),
	name: text("name").notNull(),
	lat: text("lat").notNull(),
	lon: text("lon").notNull(),
	street: text("street").notNull(),
	city: text("city").notNull(),
	state: text("state").notNull(),
	zip: text("zip").notNull(),
	lines: text("lines", { mode: "json" }).notNull().$type<string[]>(),
});

export const cachedObjects = sqliteTable("cached_objects", {
	key: text("key").primaryKey(),
	data: text("data", { mode: "json" }),
	updateAfter: text("update_after").default(sql`(current_timestamp)`),
});

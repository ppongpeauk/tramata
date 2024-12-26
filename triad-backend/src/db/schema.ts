import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const routes = sqliteTable("routes", {
	id: text("id").primaryKey(),
	color: text("color"),
	shortName: text("short_name"),
	longName: text("long_name"),
	type: integer("type"),
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

export const stops = sqliteTable("stops", {
	id: text("stop_id").primaryKey(),
	name: text("stop_name"),
	desc: text("stop_desc"),
	lat: real("stop_lat"),
	lon: real("stop_lon"),
	zoneId: text("zone_id"),
	locationType: integer("location_type"),
	parentStation: text("parent_station"),
	wheelchairBoarding: integer("wheelchair_boarding").default(1),
	levelId: text("level_id"),
});

export const stopRelations = relations(stops, ({ many }) => ({
	stopTimes: many(stopTimes),
}));

export const stopTimes = sqliteTable("stop_times", {
	id: text("id").primaryKey(),

	// Arrivals are the same as departures on WMATA's feed
	arrivalTime: integer("arrival_time", { mode: "timestamp" }).notNull(),

	tripId: text("trip_id").references(() => trips.id, { onDelete: "cascade" }),
	stopId: text("stop_id")
		.references(() => stops.id, { onDelete: "cascade" })
		.notNull(),
	stopSequence: integer("sequence").notNull(),
	shapeDistTraveled: real("shape_dist_traveled").notNull(),
});

export const stopTimesRelations = relations(stopTimes, ({ one }) => ({
	stop: one(stops, {
		fields: [stopTimes.stopId],
		references: [stops.id],
	}),
	trip: one(trips, {
		fields: [stopTimes.tripId],
		references: [trips.id],
	}),
}));

export const trips = sqliteTable("trips", {
	id: text("trip_id").primaryKey(),
	routeId: text("route_id").references(() => routes.id),
	serviceId: text("service_id"),
	tripHeadsign: text("trip_headsign"),
	directionId: text("direction_id"),
	blockId: text("block_id"),
	shapeId: text("shape_id"),
	trainId: text("train_id"),
});

export const tripsRelations = relations(trips, ({ one, many }) => ({
	stopTimes: many(stopTimes),
	route: one(routes, {
		fields: [trips.routeId],
		references: [routes.id],
	}),
}));

export const cachedObjects = sqliteTable("cached_objects", {
	key: text("key").primaryKey(),
	data: text("data", { mode: "json" }),
	updateAfter: text("update_after").default(sql`(current_timestamp)`),
});

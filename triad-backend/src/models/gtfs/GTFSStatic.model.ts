/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-25-2024
 */

import { BaseModel } from "../BaseModel.model";
import { convertTimeToTimestamp, downloadStaticGtfs } from "@/utils/gtfs";
import * as schema from "@/db/schema";
import { StopTime, Trip } from "gtfs-types";
import { getCachedObject, setCachedObject } from "@/utils/cache";

export class GTFSStaticModel extends BaseModel {
	/**
	 * Refreshes static GTFS data and caches it in KV.
	 */
	async refreshStaticData(): Promise<void> {
		const db = this.ctx.get("db");
		const kv = this.ctx.env.KV;
		const response = await downloadStaticGtfs({ ctx: this.ctx });

		/**
		 * Data to cache:
		 * - stops
		 * - routes
		 * - trips
		 * - stop_times
		 */
		const defaultExpirationTtl = 60 * 60 * 24 * 1; // 1 day

		/**
		 * Insert stops into the database.
		 */
		console.log("Inserting stops into the database...");

		for (const stop of response.stops) {
			// await kv.put(`stops:${stop.stop_id}`, JSON.stringify(stop));
			await setCachedObject(
				this.ctx,
				`stops:${stop.stop_id}`,
				stop,
				defaultExpirationTtl
			);
		}

		console.log("Inserting routes into the database...");
		for (const route of response.routes) {
			// await kv.put(`routes:${route.route_id}`, JSON.stringify(route));
			await setCachedObject(
				this.ctx,
				`routes:${route.route_id}`,
				route,
				defaultExpirationTtl
			);
		}

		console.log("Inserting trips into the database...");
		await setCachedObject(
			this.ctx,
			`trips`,
			response.trips,
			defaultExpirationTtl
		);
		// for (const trip of response.trips) {
		// 	await kv.put(`trips:${trip.trip_id}`, JSON.stringify(trip));
		// }

		/**
		 * Aggregate stop times by trip_id.
		 */
		console.log("Inserting stop times into the database...");
		const stopTimesByTripId = new Map<string, StopTime[]>();
		for (const stopTime of response.stop_times) {
			if (!stopTimesByTripId.has(stopTime.trip_id)) {
				stopTimesByTripId.set(stopTime.trip_id, []);
			}
			stopTimesByTripId.get(stopTime.trip_id)?.push(stopTime);
		}
		for (const [tripId, stopTimes] of stopTimesByTripId) {
			// await kv.put(`stop_times:${tripId}`, JSON.stringify(stopTimes));
			await setCachedObject(
				this.ctx,
				`stop_times:${tripId}`,
				stopTimes,
				defaultExpirationTtl
			);
		}

		// for (const stop of response.stops) {
		// 	await db
		// 		.insert(schema.stops)
		// 		.values({
		// 			id: stop.stop_id,
		// 			name: stop.stop_name,
		// 			desc: stop.stop_desc,
		// 			lat: stop.stop_lat,
		// 			lon: stop.stop_lon,
		// 			zoneId: stop.zone_id,
		// 			locationType: stop.location_type,
		// 			parentStation: stop.parent_station,
		// 			levelId: stop.level_id,
		// 		})
		// 		.onConflictDoNothing();
		// }

		// for (const route of response.routes) {
		// 	await db
		// 		.insert(schema.routes)
		// 		.values({
		// 			id: route.route_id,
		// 			color: route.route_color,
		// 			shortName: route.route_short_name,
		// 			longName: route.route_long_name,
		// 			type: route.route_type,
		// 		})
		// 		.onConflictDoNothing();
		// }

		// /**
		//  * Update trips into the database.
		//  */
		// for (const trip of response.trips) {
		// 	await db.insert(schema.trips).values({
		// 		id: trip.trip_id,
		// 		routeId: trip.route_id,
		// 		serviceId: trip.service_id,
		// 		tripHeadsign: trip.trip_headsign,
		// 		directionId: trip.direction_id?.toString() ?? "0",
		// 		blockId: trip.block_id,
		// 		shapeId: trip.shape_id,
		// 	});
		// }

		// /**
		//  * Insert stop times into the database.
		//  */
		// console.log("Inserting stop times into the database...");
		// for (const stopTime of response.stop_times) {
		// 	try {
		// 		const arrivalTime = convertTimeToTimestamp(
		// 			stopTime.arrival_time ?? "00:00:00"
		// 		);
		// 		await db.insert(stopTimes).values({
		// 			id: uuidv4(),
		// 			stopId: stopTime.stop_id,
		// 			arrivalTime,
		// 			tripId: stopTime.trip_id,
		// 			stopSequence: stopTime.stop_sequence,
		// 			shapeDistTraveled: stopTime.shape_dist_traveled || 0,
		// 		});
		// 	} catch (error) {
		// 		console.error(error);
		// 	}
		// }

		// /**
		//  * Insert routes into the database.
		//  */
		// console.log("Inserting routes into the database...");
		// for (const route of response.routes) {
		// 	try {
		// 		await db
		// 			.insert(routes)
		// 			.values({
		// 				id: uuidv4(),
		// 				color: route.route_color,
		// 				shortName: route.route_short_name,
		// 				longName: route.route_long_name,
		// 				type: route.route_type,
		// 			})
		// 			.onConflictDoNothing();
		// 	} catch (error) {
		// 		console.error(error);
		// 	}
		// }

		console.log("Static GTFS data refreshed and cached.");
	}

	async clearCache(): Promise<void> {
		const kv = this.ctx.env.KV;
		await kv.delete("stops");
		await kv.delete("routes");
		await kv.delete("trips");
		await kv.delete("stop_times");
	}

	async getTrips(): Promise<Trip[]> {
		const trips = await getCachedObject(this.ctx, `trips`);
		if (!trips) return [];
		return trips as Trip[];
	}

	async getTrip(tripId: string): Promise<Trip | null> {
		const trips = await this.getTrips();
		return trips.find((trip: Trip) => trip.trip_id === tripId) ?? null;
	}

	async getStopTimes(tripId: string): Promise<StopTime[] | null> {
		const stopTimes = await getCachedObject(
			this.ctx,
			`stop_times:${tripId}`
		);
		return stopTimes;
	}
}

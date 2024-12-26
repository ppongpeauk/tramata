/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-25-2024
 */

import { BaseModel } from "../BaseModel.model";
import { convertTimeToTimestamp, downloadStaticGtfs } from "@/utils/gtfs";
import { routes, stations, stops, stopTimes, trips } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export class GTFSStatic extends BaseModel {
	/**
	 * Refreshes static GTFS data and caches it in KV.
	 */
	async refreshStaticData(): Promise<void> {
		const db = this.ctx.get("db");
		const response = await downloadStaticGtfs({ ctx: this.ctx });

		/**
		 * Data to cache:
		 * - stops
		 * - routes
		 * - trips
		 * - stop_times
		 */
		const defaultExpirationTtl = 60;

		/**
		 * Insert stops into the database.
		 */
		console.log("Inserting stops into the database...");
		for (const stop of response.stops) {
			try {
				await db
					.insert(stops)
					.values({
						id: stop.stop_id,
						name: stop.stop_name,
						desc: stop.stop_desc,
						lat: stop.stop_lat,
						lon: stop.stop_lon,
						zoneId: stop.zone_id,
						locationType: stop.location_type,
						parentStation: stop.parent_station,
						levelId: stop.level_id,
					})
					.onConflictDoNothing();
			} catch (error) {
				console.error(error);
			}
		}

		/**
		 * Update trips into the database.
		 */
		for (const trip of response.trips) {
			try {
				await db
					.insert(trips)
					.values({
						id: trip.trip_id,
						routeId: trip.route_id,
						serviceId: trip.service_id,
						tripHeadsign: trip.trip_headsign,
						directionId: trip.direction_id?.toString() ?? "0",
						blockId: trip.block_id,
						shapeId: trip.shape_id,
					})
					.onConflictDoNothing();
			} catch (error) {
				console.error(error);
			}
		}

		/**
		 * Insert stop times into the database.
		 */
		console.log("Inserting stop times into the database...");
		for (const stopTime of response.stop_times) {
			try {
				const arrivalTime = convertTimeToTimestamp(
					stopTime.arrival_time ?? "00:00:00"
				);
				await db
					.insert(stopTimes)
					.values({
						id: uuidv4(),
						stopId: stopTime.stop_id,
						arrivalTime,
						tripId: stopTime.trip_id,
						stopSequence: stopTime.stop_sequence,
						shapeDistTraveled: stopTime.shape_dist_traveled || 0,
					})
					.onConflictDoNothing();
			} catch (error) {
				console.error(error);
			}
		}

		/**
		 * Insert routes into the database.
		 */
		console.log("Inserting routes into the database...");
		for (const route of response.routes) {
			try {
				await db
					.insert(routes)
					.values({
						id: uuidv4(),
						color: route.route_color,
						shortName: route.route_short_name,
						longName: route.route_long_name,
						type: route.route_type,
					})
					.onConflictDoNothing();
			} catch (error) {
				console.error(error);
			}
		}

		console.log("Static GTFS data refreshed and cached.");
	}
}

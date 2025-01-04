/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-25-2024
 */

import { BaseModel } from "../base";
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
		await setCachedObject(
			this.ctx,
			`stops`,
			response.stops,
			defaultExpirationTtl
		);
		// for (const stop of response.stops) {
		// 	// await kv.put(`stops:${stop.stop_id}`, JSON.stringify(stop));
		// 	await setCachedObject(
		// 		this.ctx,
		// 		`stops:${stop.stop_id}`,
		// 		stop,
		// 		defaultExpirationTtl
		// 	);
		// }

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
		// const stopTimesByTripId = new Map<string, StopTime[]>();
		// for (const stopTime of response.stop_times) {
		// 	if (!stopTimesByTripId.has(stopTime.trip_id)) {
		// 		stopTimesByTripId.set(stopTime.trip_id, []);
		// 	}
		// 	stopTimesByTripId.get(stopTime.trip_id)?.push(stopTime);
		// }
		// for (const [tripId, stopTimes] of stopTimesByTripId) {
		// 	// await kv.put(`stop_times:${tripId}`, JSON.stringify(stopTimes));
		// 	await setCachedObject(
		// 		this.ctx,
		// 		`stop_times:${tripId}`,
		// 		stopTimes,
		// 		defaultExpirationTtl
		// 	);
		// }

		const chunkSize = Math.ceil(response.stop_times.length / 3);
		for (let i = 0; i < response.stop_times.length; i += chunkSize) {
			const chunk = response.stop_times.slice(i, i + chunkSize);
			const chunkId = `stop_times:chunk_${Math.floor(i / chunkSize)}`;
			await setCachedObject(
				this.ctx,
				chunkId,
				chunk,
				defaultExpirationTtl
			);
		}

		console.log("Static GTFS data refreshed and cached.");
	}

	async clearCache(): Promise<void> {
		const kv = this.ctx.env.KV;
		await kv.delete("stops");
		await kv.delete("routes");
		await kv.delete("trips");
		await kv.delete("stop_times_chunk_0");
		await kv.delete("stop_times_chunk_1");
		await kv.delete("stop_times_chunk_2");
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

	async getStopTimesByStopIds({
		stopIds,
		limit,
	}: {
		stopIds: string[];
		limit?: number;
	}): Promise<StopTime[]> {
		const chunkSize = 3; // Assuming we are chunking into 3 parts
		const stopTimes: StopTime[] = [];

		for (let i = 0; i < chunkSize; i++) {
			const chunk = await getCachedObject(
				this.ctx,
				`stop_times:chunk_${i}`
			);
			if (chunk) {
				stopTimes.push(...chunk);
			}
		}

		const filteredStopTimes = stopTimes.filter((stopTime) =>
			stopIds.includes(stopTime.stop_id)
		);

		if (limit) {
			return filteredStopTimes.slice(0, limit);
		}

		return filteredStopTimes;
	}

	async getStopTimesByTripId(tripId: string): Promise<StopTime[]> {
		const chunkSize = 3; // Assuming we are chunking into 3 parts
		const stopTimes: StopTime[] = [];

		for (let i = 0; i < chunkSize; i++) {
			const chunk = await getCachedObject(
				this.ctx,
				`stop_times:chunk_${i}`
			);
			if (chunk) {
				stopTimes.push(...chunk);
			}
		}

		console.log(stopTimes.slice(0, 10));

		return (
			stopTimes.filter((stopTime) => stopTime.trip_id === tripId) ?? []
		);
	}
}

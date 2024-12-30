import { BaseModel } from "../BaseModel.model";
import { wmataApi } from "@/utils/web";
import {
	FeedEntity,
	FeedMessage,
	TripDescriptor,
} from "@/proto/src/gtfs-realtime";
import {
	StopTime as GTFSStopTime,
	Trip as GTFSTrip,
	Alert as GTFSAlert,
	VehiclePosition as GTFSVehiclePosition,
	Entity,
} from "gtfs-types";
import { getCachedObject, setCachedObject } from "@/utils/cache";
import { GTFSStaticModel } from "./GTFSStatic.model";

export type TripUpdate = {
	tripId: string;
	routeId: string;
	stopTimeUpdates: {
		stopId: string;
		arrival: number | null;
		departure: number | null;
	}[];
	trip?: TripDescriptor;
};

export type VehiclePosition = {
	vehicleId: string;
	trip: {
		tripId: string;
		routeId: string;
		directionId: number;
		startTime: string;
		startDate: string;
		scheduleRelationship: number;
	};
	vehicle: {
		id: string;
		label: string;
		licensePlate: string;
		wheelchairAccessible: number;
	};
	position: {
		latitude: number;
		longitude: number;
		bearing?: number;
		odometer?: number;
		speed?: number;
	};
	currentStopSequence: number;
	stopId: string;
	currentStatus?: number;
	timestamp: number;
	congestionLevel?: number;
	occupancyStatus?: number;
	occupancyPercentage?: number;
	multiCarriageDetails: any[]; // Adjust type as necessary
};

export type ServiceAlert = {
	id: string;
	effect: string;
	url?: string;
	headerText: string;
	descriptionText: string;
	activePeriod: {
		start: number;
		end?: number;
	}[];
	informedEntity: {
		routeId?: string;
		stopId?: string;
		trip?: TripDescriptor;
	}[];
};

export class GTFSRealtimeModel extends BaseModel {
	/**
	 * Fetches and decodes a GTFS Realtime feed from WMATA
	 */
	private async fetchFeed(endpoint: string): Promise<FeedMessage> {
		try {
			const response = await wmataApi.get(endpoint, {
				responseType: "arraybuffer",
			});
			const buffer = await response.data;
			return FeedMessage.decode(new Uint8Array(buffer));
		} catch (error) {
			console.error(`Error fetching GTFS feed from ${endpoint}:`, error);
			throw new Error("Failed to fetch GTFS feed");
		}
	}

	async refreshTripUpdates(): Promise<Entity[]> {
		const feed = await this.fetchFeed("/gtfs/rail-gtfsrt-tripupdates.pb");
		const tripUpdates = feed.entity.map((entity) => entity.tripUpdate);
		await setCachedObject(
			this.ctx,
			"tripUpdates",
			JSON.stringify(tripUpdates),
			60
		);

		// /**
		//  * Merge the trip updates with the static data.
		//  */
		// const gtfsStaticModel = new GTFSStaticModel(this.ctx);
		// const staticTrips = await gtfsStaticModel.getTrips();

		// const mergedTripUpdates: TripUpdate[] = [];
		// for (const tripUpdate of tripUpdates) {
		// 	const staticTrip = staticTrips.find(
		// 		(trip) => trip.trip_id === tripUpdate?.trip?.tripId
		// 	);
		// 	if (!staticTrip) continue;

		// 	mergedTripUpdates.push({
		// 		...tripUpdate,
		// 		...staticTrip,
		// 	});
		// }

		// return mergedTripUpdates as unknown as Entity[];

		return tripUpdates as unknown as Entity[];
	}

	async refreshVehiclePositions(): Promise<Entity[]> {
		const feed = await this.fetchFeed(
			"/gtfs/rail-gtfsrt-vehiclepositions.pb"
		);
		const vehiclePositions = feed.entity.map((entity) => entity.vehicle);

		await setCachedObject(
			this.ctx,
			"vehiclePositions",
			JSON.stringify(vehiclePositions),
			60
		);
		return vehiclePositions as unknown as Entity[];
	}

	async refreshAlerts(): Promise<Entity[]> {
		const feed = await this.fetchFeed("/gtfs/rail-gtfsrt-alerts.pb");
		const alerts = feed.entity.map((entity) => entity.alert);
		await setCachedObject(this.ctx, "alerts", JSON.stringify(alerts), 60);
		return alerts as unknown as Entity[];
	}

	async refreshRealtimeData(): Promise<void> {
		await this.refreshTripUpdates();
		await this.refreshVehiclePositions();
		await this.refreshAlerts();
	}

	async clearCache(): Promise<void> {
		await this.ctx.env.KV.delete("tripUpdates");
		await this.ctx.env.KV.delete("vehiclePositions");
		await this.ctx.env.KV.delete("alerts");
	}

	/**
	 * Get trip updates for all active trips
	 */
	async getTripUpdates(): Promise<Entity[]> {
		const cached = (await getCachedObject(
			this.ctx,
			"tripUpdates",
			"json"
		)) as Entity[] | null;

		if (cached) {
			console.debug(`[GTFSRealtime] Using cached trip updates.`);
			return cached;
		}

		console.debug(`[GTFSRealtime] Fetching trip updates from API.`);
		const feed = await this.refreshTripUpdates();
		return feed as unknown as Entity[];
	}

	/**
	 * Get positions of all active vehicles
	 */
	async getVehiclePositions(): Promise<VehiclePosition[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = (await getCachedObject(
			this.ctx,
			"vehiclePositions",
			"json"
		)) as VehiclePosition[] | null;

		if (cached) {
			console.debug(`[GTFSRealtime] Using cached vehicle positions.`);
			return cached;
		}

		console.debug(`[GTFSRealtime] Fetching vehicle positions from API.`);
		const feed = await this.refreshVehiclePositions();
		return feed as unknown as VehiclePosition[];
	}

	/**
	 * Get all active service alerts
	 */
	async getAlerts(): Promise<Entity[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = (await getCachedObject(this.ctx, "alerts", "json")) as
			| Entity[]
			| null;

		if (cached) {
			console.debug(`[GTFSRealtime] Using cached alerts.`);
			return cached;
		}

		console.debug(`[GTFSRealtime] Fetching alerts from API.`);
		const feed = await this.refreshAlerts();
		return feed as unknown as Entity[];
	}
}

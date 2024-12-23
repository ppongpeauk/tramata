import { BaseModel } from "../BaseModel.model";
import { wmataApi } from "@/utils/web";
import { FeedMessage, TripDescriptor } from "@/proto/src/gtfs-realtime";
import {
	StopTime,
	Trip,
	Alert,
	VehiclePosition as GTFSVehiclePosition,
} from "gtfs-types";
import { getCachedObject } from "@/utils/cache";

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
	tripId: string;
	stopId: string;
	position: {
		latitude: number;
		longitude: number;
		bearing?: number;
		speed?: number;
	};
	timestamp: number;
	currentStatus?: string;
	occupancyStatus?: string;
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

export class GTFSRealtime extends BaseModel {
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

	/**
	 * Get trip updates for all active trips
	 */
	async getTripUpdates(): Promise<TripUpdate[]> {
		const feed = await this.fetchFeed("/gtfs/rail-gtfsrt-tripupdates.pb");

		return feed.entity
			.filter((entity) => entity.tripUpdate)
			.map((entity) => ({
				tripId: entity.tripUpdate?.trip?.tripId || "",
				routeId: entity.tripUpdate?.trip?.routeId || "",
				stopTimeUpdates:
					entity.tripUpdate?.stopTimeUpdate.map((update) => ({
						stopId: update.stopId || "",
						arrival: update.arrival
							? Number(update.arrival.time)
							: null,
						departure: update.departure
							? Number(update.departure.time)
							: null,
					})) || [],
				trip: entity.tripUpdate?.trip,
			}));
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
		const cached = await getCachedObject(this.ctx, "vehiclePositions");
		if (cached) {
			return cached as VehiclePosition[];
		}

		const feed = await this.fetchFeed(
			"/gtfs/rail-gtfsrt-vehiclepositions.pb"
		);

		return feed.entity
			.filter((entity) => entity.vehicle)
			.map((entity) => ({
				vehicleId: entity.vehicle?.vehicle?.id || "",
				tripId: entity.vehicle?.trip?.tripId || "",
				stopId: entity.vehicle?.stopId || "",
				position: {
					latitude: entity.vehicle?.position?.latitude || 0,
					longitude: entity.vehicle?.position?.longitude || 0,
					bearing: entity.vehicle?.position?.bearing,
					speed: entity.vehicle?.position?.speed,
				},
				timestamp: entity.vehicle?.timestamp
					? Number(entity.vehicle.timestamp)
					: 0,
				currentStatus: entity.vehicle?.currentStatus?.toString(),
				occupancyStatus: entity.vehicle?.occupancyStatus?.toString(),
			}));
	}

	/**
	 * Get all active service alerts
	 */
	async getAlerts(): Promise<ServiceAlert[]> {
		const feed = await this.fetchFeed("/gtfs/rail-gtfsrt-alerts.pb");

		return feed.entity
			.filter((entity) => entity.alert)
			.map((entity) => {
				const alert = entity.alert!;
				return {
					id: entity.id || "",
					effect: alert.effect?.toString() || "",
					url: alert.url?.translation?.[0]?.text,
					headerText: alert.headerText?.translation?.[0]?.text || "",
					descriptionText:
						alert.descriptionText?.translation?.[0]?.text || "",
					activePeriod: alert.activePeriod.map((period) => ({
						start: Number(period.start || 0),
						end: period.end ? Number(period.end) : undefined,
					})),

					informedEntity: alert.informedEntity.map((entity) => ({
						routeId: entity.routeId,
						stopId: entity.stopId,
						trip: entity.trip,
					})),
				};
			});
	}
}

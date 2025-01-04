import { Alert as GTFSAlert, FeedMessage } from "@/proto/src/gtfs-realtime";
import { BaseModel } from "../base";
import { wmataApi } from "@/utils/web";
import { getCachedObject, setCachedObject } from "@/utils/cache";
import { Alert } from "@/types/alert";

export class GTFSModel extends BaseModel {
	/**
	 * Fetches and decodes a GTFS Realtime feed from WMATA
	 */
	private async fetchFeed(endpoint: string): Promise<FeedMessage> {
		try {
			const { data } = await wmataApi.get(endpoint, {
				responseType: "arraybuffer",
			});
			return FeedMessage.decode(new Uint8Array(data));
		} catch (error) {
			console.error(`Error fetching GTFS feed from ${endpoint}:`, error);
			throw new Error("Failed to fetch GTFS feed");
		}
	}

	async findAllAlerts(): Promise<Alert[]> {
		const cachedAlerts = await getCachedObject(
			this.ctx,
			"rail-alerts",
			"json"
		);
		if (cachedAlerts) return cachedAlerts as Alert[];

		const feed = await this.fetchFeed("/gtfs/rail-gtfsrt-alerts.pb");
		const alerts = feed.entity.map((entity) => entity.alert);

		const formattedAlerts = alerts.map(
			(alert: GTFSAlert | undefined) =>
				({
					route_ids:
						alert?.informedEntity
							?.map((entity) => entity.routeId)
							.filter(
								(routeId): routeId is string =>
									routeId !== undefined
							) ?? [],
					stop_ids:
						alert?.informedEntity
							?.map((entity) => entity.stopId)
							.filter(
								(stopId): stopId is string =>
									stopId !== undefined
							) ?? [],
					cause: alert?.cause,
					effect: alert?.effect,
					header_text: alert?.headerText?.translation[0]?.text,
					description_text:
						alert?.descriptionText?.translation[0]?.text,
					severity: alert?.severityLevel,
					url: alert?.url?.translation[0]?.text,
				} satisfies Alert)
		);

		await setCachedObject(
			this.ctx,
			"rail-alerts",
			JSON.stringify(formattedAlerts),
			60
		);
		return formattedAlerts as unknown as Alert[];
	}

	async findAlertsByRouteId(routeId: string): Promise<Alert[]> {
		const alerts = await this.findAllAlerts();
		return alerts.filter((alert) => alert.route_ids?.includes(routeId));
	}
}

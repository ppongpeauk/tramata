/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-21-2024
 */

import { BaseModel } from "./BaseModel.model";
import { getCachedObject, setCachedObject } from "@/utils/cache";
import { GTFSRealtimeModel } from "./gtfs/GTFSRealtime.model";

export type Alert = {
	lineCodes: string[];
	message: string;
	createdAt: Date;
	updatedAt: Date;
};

export class AlertNotFoundError extends Error {}

export class AlertModel extends BaseModel {
	async list(): Promise<Alert[]> {
		/**
		 * Get alerts from the GTFS feed
		 */
		const gtfsRealtimeModel = new GTFSRealtimeModel(this.ctx);
		const gtfsRealtimeData = await gtfsRealtimeModel.getAlerts();

		const response = gtfsRealtimeData.map((alert) => ({
			lineCodes: alert.informedEntity.map((entity) => entity.routeId),
			message: alert.descriptionText.translation[0].text,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		return response;
	}

	async listByLineCode(lineCode: string): Promise<Alert[]> {
		const alerts = await this.list();
		return alerts.filter((alert) => alert.lineCodes.includes(lineCode));
	}
}

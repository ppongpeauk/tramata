import { PickupDropoffType, Route, VehicleType } from "gtfs-types";
import { BaseModel } from "../BaseModel.model";
import { GTFSStatic } from "./GTFSStatic.model";

export interface GTFSLine {
	routeId: string;
	agencyId?: string;
	routeShortName?: string;
	routeLongName?: string;
	routeDesc?: string;
	routeType: VehicleType;
	routeUrl?: string;
	routeColor?: string;
	routeTextColor?: string;
	routeSortOrder?: number;
	continuousPickup?: PickupDropoffType | "";
	continuousDropOff?: PickupDropoffType | "";
}

export class GTFSLineModel extends BaseModel {
	/**
	 * Get all lines.
	 * @returns An array of GTFSLine objects.
	 */
	async getLines() {
		const gtfsStaticModel = new GTFSStatic(this.ctx);
		const gtfsStaticData = await gtfsStaticModel.getStaticData();

		const lines = gtfsStaticData.routes.map((route: Route) => {
			return {
				routeId: route.route_id,
				agencyId: route.agency_id,
				routeShortName: route.route_short_name,
				routeLongName: route.route_long_name,
				routeDesc: route.route_desc,
				routeType: route.route_type,
				routeUrl: route.route_url,
				routeColor: route.route_color,
				routeTextColor: route.route_text_color,
				routeSortOrder: route.route_sort_order,
				continuousPickup: route.continuous_pickup,
				continuousDropOff: route.continuous_drop_off,
			};
		});

		return lines;
	}

	/**
	 * Get a line by its route ID.
	 * @param routeId - The route ID to get the line for. Example: "SV" for the Silver Line.
	 * @returns A GTFSLine object.
	 */
	async getLine(routeId: string) {
		const lines = await this.getLines();
		return lines.find((line: GTFSLine) => line.routeId === routeId);
	}
}

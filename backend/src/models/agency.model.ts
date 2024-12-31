import { wmataApi } from "@/utils/web";

import { BaseModel } from "./base";
import { RouteModel } from "./route.model";

import agencyData from "@/static/agency.json";
import { Agency } from "@/types/agency";

export class AgencyNotFoundError extends Error {}

export class AgencyModel extends BaseModel {
	public findAll() {
		return agencyData;
	}

	public findById(agency_id: string): Agency {
		const agency = agencyData.find(
			(agency) => agency.agency_id === agency_id
		) as Agency;

		if (!agency)
			throw new AgencyNotFoundError(`Agency ${agency_id} not found.`);

		/**
		 * Aggregate routes for the agency.
		 */
		const routeModel = new RouteModel(this.ctx);
		const routes = routeModel.listByAgencyId(agency_id);
		agency.routes = routes;

		return agency;
	}
}

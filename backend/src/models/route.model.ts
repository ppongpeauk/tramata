import { Route } from "@/types/route";
import { BaseModel } from "./base";

import routesData from "@/static/routes.json";

export class RouteNotFoundError extends Error {}

export class RouteModel extends BaseModel {
	public listByAgencyId(agency_id: string): Route[] {
		return routesData.filter((route) => route.agency_id === agency_id);
	}

	public findById(route_id: string): Route {
		const route = routesData.find((route) => route.route_id === route_id);
		if (!route) {
			throw new RouteNotFoundError(`Route ${route_id} not found.`);
		}
		return route;
	}
}

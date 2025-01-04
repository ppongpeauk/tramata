import { Route } from "@/types/route";
import { BaseModel } from "./base";

import routesData from "@/static/routes.json";
import stopsData from "@/static/stops.json";
import routeOrderData from "@/static/rail_route_order.json";
import mappings from "@/constants/mappings";
import { GTFSModel } from "./rail/gtfs.model";
import { TrackModel } from "./rail/track.model";
import { stationPairs } from "@/constants/intersections";

export class RouteNotFoundError extends Error {}

export class RouteModel extends BaseModel {
	public listByAgencyId(agency_id: string): Route[] {
		return routesData.filter((route) => route.agency_id === agency_id);
	}

	public async findById(route_id: string): Promise<Route> {
		let route = routesData.find(
			(route) => route.route_id === route_id
		) as Route | null;
		if (!route) {
			throw new RouteNotFoundError(`Route ${route_id} not found.`);
		}

		const gtfsModel = new GTFSModel(this.ctx);
		const trackModel = new TrackModel(this.ctx);

		const stops = stopsData.filter((stop) =>
			stop.route_ids?.includes(route_id)
		);

		const alerts = await gtfsModel.findAlertsByRouteId(route_id);

		// Get code for route
		const routeShortCode = mappings.rail.routeMappings.get(route_id);
		if (!routeShortCode) {
			throw new RouteNotFoundError(`Route ${route_id} not found.`);
		}

		// Get tracks for this line and sort them
		const tracks = await trackModel.listFromLineCode(routeShortCode);

		// Create a set of sorted station codes based on track order
		const stationCodesSorted = new Set<string>();
		for (const track of tracks) {
			if (!track.stationCode) continue;

			const stationCode = track.stationCode;

			// Check if this station code is part of a station pair
			const matchedPair = Object.entries(stationPairs).find(
				([_, codes]) => codes.includes(stationCode)
			);

			if (matchedPair) {
				stationCodesSorted.add(`STN_${matchedPair[0]}`);
				stationCodesSorted.add(`STN_${matchedPair[1]}`);
			} else {
				stationCodesSorted.add(`STN_${stationCode}`);
			}
		}

		// Sort stops based on the track-derived station order
		route.stops = stops.sort((a, b) => {
			console.log(a.stop_id, b.stop_id);
			const aIndex = Array.from(stationCodesSorted).indexOf(a.stop_id);
			const bIndex = Array.from(stationCodesSorted).indexOf(b.stop_id);
			return aIndex - bIndex;
		});

		// Fallback to route order data if track-based sorting didn't work
		if (
			!route.stops.some((stop) =>
				Array.from(stationCodesSorted).includes(stop.stop_id)
			)
		) {
			const routeOrder =
				routeOrderData[routeShortCode as keyof typeof routeOrderData];
			if (!routeOrder) {
				throw new RouteNotFoundError(`Route ${route_id} not found.`);
			}

			route.stops = stops.sort((a, b) => {
				const aOrder = routeOrder.indexOf(a.stop_id);
				const bOrder = routeOrder.indexOf(b.stop_id);
				return aOrder - bOrder;
			});
		}

		route.alerts = alerts;
		return route;
	}
}

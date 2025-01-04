/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 */

import { BaseModel } from "../base";
import { APITrack, Track } from "./track.model";

/**
 * Static data for WMATA Standard Routes.
 */
import standardRoutes from "@/static/api_routes.json";

export type APIStandardRoute = {
	LineCode: string;
	TrackNum: number;
	TrackCircuits: APIStandardRouteTrack[];
};
export type APIStandardRouteTrack = APITrack & {
	SeqNum: number;
};

export type StandardRouteTrack = Omit<Track, "neighbors"> & {
	seqNum: number;
};
export type StandardRoute = {
	lineCode: string;
	trackNum: number;
	trackCircuits: StandardRouteTrack[];
};

export class RouteNotFoundError extends Error {}

export class RouteModel extends BaseModel {
	async list(): Promise<StandardRoute[]> {
		const apiData = standardRoutes as {
			StandardRoutes: APIStandardRoute[];
		};

		const response = apiData.StandardRoutes.map((route) => ({
			lineCode: route.LineCode,
			trackNum: route.TrackNum,
			trackCircuits: route.TrackCircuits.map((circuit) => ({
				circuitId: circuit.CircuitId,
				stationCode: circuit.StationCode,
				seqNum: circuit.SeqNum,
			})),
		}));

		return response;
	}

	async get(lineCode: string) {
		const routes = await this.list();
		return routes.find((route) => route.lineCode === lineCode);
	}
}

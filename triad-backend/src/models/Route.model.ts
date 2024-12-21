import { getCachedObject, setCachedObject } from "@/utils/cache";
import { BaseModel } from "./BaseModel.model";
import { APITrack, Track } from "./Track.model";
import { wmataApi } from "@/utils/web";

export type APIStandardRoute = {
	LineCode: string;
	TrackNum: number;
	TrackCircuits: APITrack[];
};

export type StandardRouteTrack = Omit<Track, "neighbors">;
export type StandardRoute = {
	lineCode: string;
	trackNum: number;
	trackCircuits: StandardRouteTrack[];
};

export class RouteModel extends BaseModel {
	async list(): Promise<StandardRoute[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = await getCachedObject(this.ctx, "standardRoutes");
		if (cached) {
			return cached as StandardRoute[];
		}

		const url = "/TrainPositions/StandardRoutes?contentType=json";
		const apiResponse = await wmataApi.get(url);
		const apiData = apiResponse.data as {
			StandardRoutes: APIStandardRoute[];
		};

		const response = apiData.StandardRoutes.map((route) => ({
			lineCode: route.LineCode,
			trackNum: route.TrackNum,
			trackCircuits: route.TrackCircuits.map((circuit) => ({
				seqNum: circuit.SeqNum,
				circuitId: circuit.CircuitId,
				stationCode: circuit.StationCode,
			})),
		}));

		await setCachedObject(
			this.ctx,
			"standardRoutes",
			response,
			60 * 60 * 1
		);

		return response;
	}
}

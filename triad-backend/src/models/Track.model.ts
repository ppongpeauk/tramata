import { getCachedObject, setCachedObject } from "@/utils/cache";
import { BaseModel } from "./BaseModel.model";
import { wmataApi } from "@/utils/web";
import { RouteModel } from "./Route.model";

export type APITrack = {
	SeqNum: number;
	CircuitId: number;
	StationCode?: null;
	Neighbors: {
		NeighborType: "Left" | "Right";
		CircuitIds: number[];
	}[];
};

export type Track = {
	seqNum: number;
	circuitId: number;
	stationCode?: null;
	neighbors: {
		neighborType: "Left" | "Right";
		circuitIds: number[];
	}[];
};

export class TrackModel extends BaseModel {
	async list(): Promise<Track[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = await getCachedObject(this.ctx, "tracks");
		if (cached) {
			return cached as Track[];
		}

		const url = "/TrainPositions/TrackCircuits?contentType=json";
		const apiResponse = await wmataApi.get(url);
		const apiData = apiResponse.data as { TrackCircuits: APITrack[] };

		const response = apiData.TrackCircuits.map((track) => ({
			seqNum: track.SeqNum,
			circuitId: track.CircuitId,
			stationCode: track.StationCode,
			neighbors: track.Neighbors.map((neighbor) => ({
				neighborType: neighbor.NeighborType,
				circuitIds: neighbor.CircuitIds,
			})),
		}));

		await setCachedObject(this.ctx, "tracks", response, 60 * 60 * 1);

		return response;
	}
	async listFromLineCode(lineCode: string) {
		const routesModel = new RouteModel(this.ctx);
		const routes = await routesModel.list();
		const lineRoutes = routes.filter(
			(route) => route.lineCode === lineCode
		);
		const tracks = lineRoutes.flatMap((route) => route.trackCircuits);

		const allTracks = await this.list();
		const allTracksMap = new Map<number, Track>();
		allTracks.forEach((track) => {
			allTracksMap.set(track.circuitId, track);
		});

		// Return all tracks that are in the tracks array
		return tracks.map((track) => {
			const allTrack = allTracksMap.get(track.circuitId);
			return {
				...track,
				neighbors: allTrack?.neighbors,
			};
		});
	}
}

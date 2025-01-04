import { BaseModel } from "../base";
import { RouteModel } from "./route.model";

/**
 * Static data for WMATA Track Circuits.
 */
import trackCircuits from "@/static/api_track_circuits.json";

export type APITrack = {
	CircuitId: number;
	StationCode?: null;
	Neighbors: {
		NeighborType: "Left" | "Right";
		CircuitIds: number[];
	}[];
};

export type Track = {
	circuitId: number;
	stationCode?: null;
	neighbors: {
		neighborType: "Left" | "Right";
		circuitIds: number[];
	}[];
};

export class TrackModel extends BaseModel {
	async list(): Promise<Track[]> {
		const apiData = trackCircuits as { TrackCircuits: APITrack[] };

		const response = apiData.TrackCircuits.map((track) => ({
			circuitId: track.CircuitId,
			stationCode: track.StationCode,
			neighbors: track.Neighbors.map((neighbor) => ({
				neighborType: neighbor.NeighborType,
				circuitIds: neighbor.CircuitIds,
			})),
		}));

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

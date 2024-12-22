/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-21-2024
 */

import { wmataApi } from "@/utils/web";
import { BaseModel } from "./BaseModel.model";
import { Station, StationModel } from "./Station.model";
import { getCachedObject, setCachedObject } from "@/utils/cache";
import { TrackModel } from "./Track.model";

export type APILine = {
	LineCode: string;
	DisplayName: string;
	StartStationCode: string;
	EndStationCode: string;
	InternalDestination1: string;
	InternalDestination2: string;
};

export type Line = {
	lineCode: string;
	displayName: string;

	startStationCode: string;
	endStationCode: string;

	stations: Station[];

	internalDestination1: string;
	internalDestination2: string;
};

export class LineNotFoundError extends Error {}

export class LineModel extends BaseModel {
	async list(): Promise<Line[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = await getCachedObject(this.ctx, "lines");
		if (cached) {
			return cached as Line[];
		}

		const url = "/Rail.svc/json/jLines";
		const apiResponse = await wmataApi.get(url);
		const apiData = apiResponse.data as { Lines: APILine[] };

		const stationModel = new StationModel(this.ctx);
		const stations = await stationModel.list();

		const response = apiData.Lines.map((line) => ({
			lineCode: line.LineCode,
			displayName: line.DisplayName,

			startStationCode: line.StartStationCode,
			endStationCode: line.EndStationCode,

			internalDestination1: line.InternalDestination1,
			internalDestination2: line.InternalDestination2,

			stations: stations.filter(
				(station) =>
					station.lineCode1 === line.LineCode ||
					station.lineCode2 === line.LineCode ||
					station.lineCode3 === line.LineCode ||
					station.lineCode4 === line.LineCode
			),
		}));

		// Cache for 1 hour
		await setCachedObject(this.ctx, "lines", response, 60 * 60 * 1);

		return response;
	}
	async getStationsFromLineCode(lineCode: string) {
		const url = `/Rail.svc/json/jStations?LineCode=${lineCode}`;
		const response = await wmataApi.get(url);
		return response.data;
	}
	async get(lineCode: string) {
		const lines = await this.list();
		let line = lines.find((line) => line.lineCode === lineCode);
		if (!line) {
			throw new LineNotFoundError();
		}
		const stations = line.stations;

		const tracksModel = new TrackModel(this.ctx);
		const tracks = await tracksModel.listFromLineCode(lineCode);
		const tracksSorted = tracks.sort((a, b) => a.seqNum - b.seqNum);
		let stationCodesSorted = new Set<string>();
		let stationsSorted: Station[] = [];

		/**
		 * Start from the first track and traverse the tracks in order.
		 * Add the station codes to the array.
		 */
		for (const track of tracksSorted) {
			if (track.stationCode) {
				stationCodesSorted.add(track.stationCode);
			}
		}

		/**
		 * Start from the first station code and traverse the stations in order.
		 * Add the station codes to the array.
		 */
		for (const stationCode of stationCodesSorted) {
			const station = stations.find(
				(station) => station.code === stationCode
			);
			if (station) {
				stationsSorted.push(station);
			}
		}

		return {
			...line,
			stations: stationsSorted,
			tracks: tracksSorted,
		};
	}
}

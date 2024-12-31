/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-21-2024
 */

import { BaseModel } from "./BaseModel.model";
import { Station, StationModel } from "./Station.model";
import { TrackModel } from "./Track.model";
import { RouteModel, RouteNotFoundError } from "./Route.model";
import linesData from "@/static/api_lines.json";
import { Alert, AlertModel } from "./Alert.model";

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

	alerts: Alert[];

	startStation?: Station;
	endStation?: Station;

	stations: Station[];

	internalDestination1: string;
	internalDestination2: string;
};

export class LineNotFoundError extends Error {}

export class LineModel extends BaseModel {
	async list(): Promise<Line[]> {
		const apiData = linesData as { Lines: APILine[] };

		const stationModel = new StationModel(this.ctx);
		const stations = await stationModel.list();

		const alertModel = new AlertModel(this.ctx);
		const alerts = await alertModel.list();

		const response = apiData.Lines.map((line) => ({
			lineCode: line.LineCode,
			displayName: line.DisplayName,

			startStationCode: line.StartStationCode,
			endStationCode: line.EndStationCode,

			internalDestination1: line.InternalDestination1,
			internalDestination2: line.InternalDestination2,

			startStation: stations.find(
				(station) => station.code === line.StartStationCode
			),
			endStation: stations.find(
				(station) => station.code === line.EndStationCode
			),

			alerts: alerts.filter((alert) =>
				alert.lineCodes.includes(line.LineCode)
			),

			stations: stations.filter((station) =>
				station.lines?.includes(line.LineCode)
			),
		}));

		return response;
	}
	async getStationsFromLineCode(lineCode: string): Promise<Station[]> {
		const stationModel = new StationModel(this.ctx);
		const allStations = await stationModel.list();
		const stations = allStations.filter((station) =>
			station.lines?.includes(lineCode)
		);
		return stations;
	}
	async get(lineCode: string): Promise<Line | null> {
		const lines = await this.list();
		let line = lines.find((line) => line.lineCode === lineCode);
		if (!line) {
			throw new LineNotFoundError();
		}
		const stationModel = new StationModel(this.ctx);
		const trackModel = new TrackModel(this.ctx);
		const routeModel = new RouteModel(this.ctx);

		const route = await routeModel.get(lineCode);
		if (!route) throw new RouteNotFoundError();

		const stations = line.stations;

		const tracks = await trackModel.listFromLineCode(lineCode);
		const tracksSorted = tracks.sort((a, b) => {
			const aRoute = route.trackCircuits.find(
				(circuit) => circuit.circuitId === a.circuitId
			);
			const bRoute = route.trackCircuits.find(
				(circuit) => circuit.circuitId === b.circuitId
			);
			return (aRoute?.seqNum ?? 0) - (bRoute?.seqNum ?? 0);
		});
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
		 * Get all outages for all stations.
		 * We're doing this here so we don't have to call the cache every time we get a station.
		 */
		const outages = await stationModel.listAllOutages();

		/**
		 * Start from the first station code and traverse the stations in order.
		 * Add the station codes to the array.
		 */
		for (const stationCode of stationCodesSorted) {
			let station = stations.find(
				(station) => station.code === stationCode
			);
			if (station) {
				station.outages = outages.filter(
					(outage) => outage.stationCode === stationCode
				);
				stationsSorted.push(station);
			}
		}

		return {
			...line,
			stations: stationsSorted,
		};
	}
}

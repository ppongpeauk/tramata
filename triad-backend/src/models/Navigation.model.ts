import { BaseModel } from "./BaseModel.model";
import { wmataApi } from "@/utils/web";
import { StationModel } from "./Station.model";

export type MetroPathItem = {
	distanceToPrev: number;
	lineCode: string;
	seqNum: number;
	stationCode: string;
	stationName: string;
};

export type NavigationStep = {
	type: "RIDE" | "TRANSFER" | "WALK";
	fromStation: string;
	toStation: string;
	line?: string;
	duration: number; // in minutes
	distance?: number; // in feet
	timeframe: {
		start: string;
		end: string;
	};
};

export type NavigationRoute = {
	steps: NavigationStep[];
	totalDuration: number;
	totalDistance: number;
	fare: {
		peakTime: number;
		offPeakTime: number;
		seniorDisabled: number;
	};
};

type Line = {
	code: string;
	stations: string[];
};

export class NavigationModel extends BaseModel {
	private lines: Line[] = [
		{
			code: "RD",
			stations: [
				"A15",
				"A14",
				"A13",
				"A12",
				"A11",
				"A10",
				"A09",
				"A08",
				"A07",
				"A06",
				"A05",
				"A04",
				"A03",
				"A02",
				"A01",
				"B01",
				"B02",
				"B03",
				"B04",
				"B05",
				"B06",
				"B07",
				"B08",
				"B09",
				"B10",
				"B11",
			],
		},
		{
			code: "BL",
			stations: [
				"J03",
				"J02",
				"K05",
				"K04",
				"K03",
				"K02",
				"K01",
				"C05",
				"C04",
				"C03",
				"C02",
				"C01",
				"D01",
				"D02",
				"D03",
				"D04",
				"D05",
				"D06",
				"D07",
				"D08",
				"G01",
				"G02",
				"G03",
				"G04",
				"G05",
			],
		},
		{
			code: "YL",
			stations: [
				"C15",
				"C14",
				"C13",
				"C12",
				"C11",
				"C10",
				"C09",
				"C08",
				"C07",
				"C06",
				"C05",
				"C04",
				"C03",
				"C02",
				"C01",
				"D01",
				"F01",
				"F02",
				"F03",
				"F04",
				"F05",
				"F06",
				"F07",
				"F08",
				"E01",
				"E02",
				"E03",
				"E04",
				"E05",
				"E06",
			],
		},
		{
			code: "OR",
			stations: [
				"K08",
				"K07",
				"K06",
				"K05",
				"K04",
				"K03",
				"K02",
				"K01",
				"C05",
				"C04",
				"C03",
				"C02",
				"C01",
				"D01",
				"D02",
				"D03",
				"D04",
				"D05",
				"D06",
				"D07",
				"D08",
				"D09",
				"D10",
				"D11",
				"D12",
				"D13",
			],
		},
		{
			code: "GR",
			stations: [
				"F11",
				"F10",
				"F09",
				"F08",
				"F07",
				"F06",
				"F05",
				"F04",
				"F03",
				"F02",
				"F01",
				"E01",
				"E02",
				"E03",
				"E04",
				"E05",
				"E06",
				"E07",
				"E08",
				"E09",
				"E10",
			],
		},
		{
			code: "SV",
			stations: [
				"N06",
				"N04",
				"N03",
				"N02",
				"N01",
				"K05",
				"K04",
				"K03",
				"K02",
				"K01",
				"C05",
				"C04",
				"C03",
				"C02",
				"C01",
				"D01",
				"D02",
				"D03",
				"D04",
				"D05",
				"D06",
				"D07",
				"D08",
				"G01",
				"G02",
				"G03",
				"G04",
				"G05",
			],
		},
	];

	/**
	 * Calculate the estimated duration between two stations based on distance
	 * Average metro speed is about 33 mph = 48.4 feet per second
	 */
	private calculateDuration(distanceInFeet: number): number {
		const METRO_SPEED_FPS = 48.4;
		const STATION_STOP_TIME = 45; // seconds
		return Math.ceil(
			(distanceInFeet / METRO_SPEED_FPS + STATION_STOP_TIME) / 60
		);
	}

	/**
	 * Calculate fare between two stations
	 * This is a simplified version - in reality, WMATA's fare calculation is more complex
	 */
	private calculateFare(distance: number): {
		peakTime: number;
		offPeakTime: number;
		seniorDisabled: number;
	} {
		// Base fare + distance-based fare
		const peakTime =
			2.25 + Math.min(3.85, Math.ceil(distance / 5280) * 0.326);
		const offPeakTime = peakTime * 0.85;
		const seniorDisabled = peakTime * 0.5;

		return {
			peakTime: Number(peakTime.toFixed(2)),
			offPeakTime: Number(offPeakTime.toFixed(2)),
			seniorDisabled: Number(seniorDisabled.toFixed(2)),
		};
	}

	/**
	 * Get path between two stations on the same line
	 */
	private async getPath(
		fromStationCode: string,
		toStationCode: string
	): Promise<MetroPathItem[]> {
		try {
			const response = await wmataApi.get(`/Rail.svc/json/jPath`, {
				params: {
					FromStationCode: fromStationCode,
					ToStationCode: toStationCode,
				},
			});
			return response.data.Path.map((item: any) => ({
				distanceToPrev: item.DistanceToPrev,
				lineCode: item.LineCode,
				seqNum: item.SeqNum,
				stationCode: item.StationCode,
				stationName: item.StationName,
			}));
		} catch (error) {
			console.error("Error getting path:", error);
			return [];
		}
	}

	/**
	 * Find lines that contain a station
	 */
	private findLinesForStation(stationCode: string): string[] {
		return this.lines
			.filter((line) => line.stations.includes(stationCode))
			.map((line) => line.code);
	}

	/**
	 * Find transfer stations between two lines
	 */
	private findTransferStations(line1: string, line2: string): string[] {
		const line1Stations =
			this.lines.find((l) => l.code === line1)?.stations || [];
		const line2Stations =
			this.lines.find((l) => l.code === line2)?.stations || [];
		return line1Stations.filter((station) =>
			line2Stations.includes(station)
		);
	}

	/**
	 * Find all possible transfer paths between two stations
	 */
	private async findTransferPaths(
		fromStationCode: string,
		toStationCode: string
	): Promise<MetroPathItem[][]> {
		const fromLines = this.findLinesForStation(fromStationCode);
		const toLines = this.findLinesForStation(toStationCode);
		const paths: MetroPathItem[][] = [];

		for (const fromLine of fromLines) {
			for (const toLine of toLines) {
				if (fromLine === toLine) continue;

				const transferStations = this.findTransferStations(
					fromLine,
					toLine
				);
				for (const transferStation of transferStations) {
					const path1 = await this.getPath(
						fromStationCode,
						transferStation
					);
					if (path1.length === 0) continue;

					const path2 = await this.getPath(
						transferStation,
						toStationCode
					);
					if (path2.length === 0) continue;

					const combinedPath = [...path1];
					path2.slice(1).forEach((item) => {
						combinedPath.push(item);
					});

					paths.push(combinedPath);
				}
			}
		}

		return paths;
	}

	/**
	 * Calculate route between two stations
	 */
	async calculateRoute(
		fromStationCode: string,
		toStationCode: string
	): Promise<NavigationRoute> {
		const stationModel = new StationModel(this.ctx);
		const fromStation = await stationModel.get(fromStationCode);
		const toStation = await stationModel.get(toStationCode);

		if (!fromStation || !toStation) {
			throw new Error("Invalid station codes");
		}

		// Try direct path first
		const directPath = await this.getPath(fromStationCode, toStationCode);
		if (directPath.length > 0) {
			return this.processPath(directPath);
		}

		// Try paths with transfers
		const transferPaths = await this.findTransferPaths(
			fromStationCode,
			toStationCode
		);
		if (transferPaths.length > 0) {
			// Find the path with the shortest total distance
			let shortestPath = transferPaths[0];
			let shortestDistance = this.calculateTotalDistance(shortestPath);

			for (const path of transferPaths.slice(1)) {
				const distance = this.calculateTotalDistance(path);
				if (distance < shortestDistance) {
					shortestPath = path;
					shortestDistance = distance;
				}
			}

			return this.processPath(shortestPath);
		}

		throw new Error("No path found between stations");
	}

	/**
	 * Calculate total distance of a path
	 */
	private calculateTotalDistance(path: MetroPathItem[]): number {
		return path.reduce(
			(total, item) => total + (item.distanceToPrev || 0),
			0
		);
	}

	/**
	 * Process a path into a navigation route
	 */
	private processPath(path: MetroPathItem[]): NavigationRoute {
		const steps: NavigationStep[] = [];
		let totalDistance = 0;
		let totalDuration = 0;
		let currentTime = new Date();

		let currentLineSegment: {
			line: string;
			startStation: MetroPathItem;
			distance: number;
			stations: MetroPathItem[];
		} | null = null;

		// Process each segment of the path
		for (let i = 1; i < path.length; i++) {
			const prevStation = path[i - 1];
			const currStation = path[i];
			const distance = currStation.distanceToPrev;

			// If line changes or this is the last station, add the accumulated segment
			if (
				prevStation.lineCode !== currStation.lineCode ||
				i === path.length - 1
			) {
				if (currentLineSegment) {
					// Add the last station to the current segment if we're on the same line
					if (prevStation.lineCode === currStation.lineCode) {
						currentLineSegment.distance += distance;
						currentLineSegment.stations.push(currStation);
					}

					// Calculate duration for the entire segment
					const duration = this.calculateDuration(
						currentLineSegment.distance
					);
					const rideStartTime = new Date(currentTime);
					currentTime.setMinutes(currentTime.getMinutes() + duration);

					// Add the ride step
					steps.push({
						type: "RIDE",
						fromStation:
							currentLineSegment.startStation.stationName,
						toStation:
							currentLineSegment.stations[
								currentLineSegment.stations.length - 1
							].stationName,
						line: currentLineSegment.line,
						duration,
						distance: currentLineSegment.distance,
						timeframe: {
							start: rideStartTime.toLocaleTimeString(),
							end: currentTime.toLocaleTimeString(),
						},
					});

					totalDistance += currentLineSegment.distance;
					totalDuration += duration;
				}

				// If the line changed, add a transfer step
				if (prevStation.lineCode !== currStation.lineCode) {
					const transferDuration = 5; // 5 minutes for transfer
					const transferStartTime = new Date(currentTime);
					currentTime.setMinutes(
						currentTime.getMinutes() + transferDuration
					);

					steps.push({
						type: "TRANSFER",
						fromStation: prevStation.stationName,
						toStation: currStation.stationName,
						duration: transferDuration,
						timeframe: {
							start: transferStartTime.toLocaleTimeString(),
							end: currentTime.toLocaleTimeString(),
						},
					});

					totalDuration += transferDuration;
				}

				// Start a new segment
				currentLineSegment = {
					line: currStation.lineCode,
					startStation: currStation,
					distance: 0,
					stations: [currStation],
				};
			} else {
				// Add to current segment
				if (currentLineSegment) {
					currentLineSegment.distance += distance;
					currentLineSegment.stations.push(currStation);
				} else {
					currentLineSegment = {
						line: prevStation.lineCode,
						startStation: prevStation,
						distance: distance,
						stations: [prevStation, currStation],
					};
				}
			}
		}

		return {
			steps,
			totalDuration,
			totalDistance,
			fare: this.calculateFare(totalDistance),
		};
	}
}

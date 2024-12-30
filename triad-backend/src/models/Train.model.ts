/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-22-2024
 */

import { BaseModel } from "./BaseModel.model";
import { GTFSRealtimeModel } from "./gtfs/GTFSRealtime.model";
import { GTFSStaticModel } from "./gtfs/GTFSStatic.model";
import { Line, LineModel } from "./Line.model";
import { Station, StationModel, StationArrival } from "./Station.model";
import mappings from "@/constants/mappings";

/**
 * Type for train predictions with station information
 */
type StationTrainPredictionWithStation = StationArrival & {
	station?: Station;
};

export type Train = {
	vehicle: {
		id: string;
		label: string;

		stopSequence: number;

		latitude: number;
		longitude: number;
		bearing: number;
	};
	line: Line;
	trip: {
		id: string;
		routeId: string;
		directionId: string;
	};
};

export class TrainNotFoundError extends Error {}

export class TrainModel extends BaseModel {
	/**
	 * Gets train predictions for stations near a given location
	 * @param latitude - Latitude coordinate of user location
	 * @param longitude - Longitude coordinate of user location
	 * @param numStations - Number of nearest stations to check
	 * @returns Array of train predictions sorted by arrival time and distance
	 */
	async getNearbyTrainPredictions(
		latitude: number,
		longitude: number,
		numStations: number
	) {
		return [];
		// // Initialize station model and get required data
		// const stationModel = new StationModel(this.ctx);
		// const [stations, allStationEntrances, nearbyStationEntrances] =
		// 	await Promise.all([
		// 		stationModel.list(),
		// 		stationModel.getAllStationEntrances(),
		// 		stationModel.getNearbyStationEntrances(
		// 			latitude,
		// 			longitude,
		// 			numStations
		// 		),
		// 	]);

		// // Get unique station codes from nearby entrances
		// const stationCodes = new Set<string>();
		// nearbyStationEntrances.forEach((station) => {
		// 	if (station.stationCode1) stationCodes.add(station.stationCode1);
		// 	if (station.stationCode2) stationCodes.add(station.stationCode2);
		// });

		// // Get predictions for all nearby stations
		// const allPredictions = await stationModel.listAllPredictions();
		// let predictions = allPredictions.filter((prediction) =>
		// 	stationCodes.has(prediction.locationCode)
		// );

		// // Filter out "No Passenger" trains
		// predictions = predictions.filter(
		// 	(prediction) => prediction.destinationName !== "No Passenger"
		// );

		// // Custom sort function to handle "ARR" and numeric minutes
		// const sortByMinutes = (a: string, b: string) => {
		// 	if (["ARR", "BRD"].includes(a)) return -1;
		// 	if (["ARR", "BRD"].includes(b)) return 1;
		// 	return parseInt(a) - parseInt(b);
		// };

		// // Sort predictions by arrival time
		// predictions.sort(
		// 	(a: StationTrainPrediction, b: StationTrainPrediction) =>
		// 		sortByMinutes(a.min, b.min)
		// );

		// /**
		//  * Map to store unique train predictions
		//  * Key: combination of line-station-destination
		//  * Value: [prediction with station info, distance from user]
		//  */
		// const trainPredictions = new Map<
		// 	string,
		// 	[StationTrainPredictionWithStation, number]
		// >();

		// // Process each prediction
		// for (const prediction of predictions) {
		// 	// Find corresponding station entrance
		// 	const stationEntrance = allStationEntrances.find(
		// 		(entrance) =>
		// 			entrance.stationCode1 === prediction.locationCode ||
		// 			entrance.stationCode2 === prediction.locationCode
		// 	);

		// 	if (!stationEntrance) continue;

		// 	// Calculate distance from user to station
		// 	const distance = stationModel.calculateDistance(
		// 		latitude,
		// 		longitude,
		// 		stationEntrance.lat,
		// 		stationEntrance.lon
		// 	);

		// 	// Create unique key for this train
		// 	const key = `${prediction.line}-${prediction.locationCode}-${prediction.destination}`;

		// 	// Add station info to prediction
		// 	const predictionWithStation = {
		// 		...prediction,
		// 		station: stations.find(
		// 			(station) => station.code === prediction.locationCode
		// 		),
		// 	};

		// 	// Update map if this is a new prediction or closer than existing one
		// 	const existingPrediction = trainPredictions.get(key);
		// 	if (!existingPrediction || distance < existingPrediction[1]) {
		// 		trainPredictions.set(key, [predictionWithStation, distance]);
		// 	}
		// }

		// // Sort predictions by distance and return only the prediction data
		// return Array.from(trainPredictions.values())
		// 	.sort((a, b) => a[1] - b[1])
		// 	.map(([prediction, _]) => prediction);
	}

	async getTrains(): Promise<Train[]> {
		const gtfsRealtimeModel = new GTFSRealtimeModel(this.ctx);
		const gtfsStaticModel = new GTFSStaticModel(this.ctx);
		const linesModel = new LineModel(this.ctx);

		const trainPositions = await gtfsRealtimeModel.getVehiclePositions();
		let lines = await linesModel.list();

		// Remove "stations" attribute from lines
		lines = lines.map((line) => ({
			...line,
			stations: [],
		}));

		const response: Train[] = [];

		const lineMappings = mappings.rail.routeMappings; // e.g. SILVER => SV

		for (const trainPosition of trainPositions) {
			const tpVehicle = trainPosition.vehicle;
			const tpPosition = trainPosition.position;
			const tpTrip = trainPosition.trip;

			if (!tpVehicle || !tpTrip || !tpPosition) {
				console.error("Invalid train position data:", trainPosition);
				continue;
			}

			const tpStopSequence = trainPosition.currentStopSequence;

			/**
			 * This normally shouldn't happen, but just in case there's
			 * a train that doesn't have a route_id, we skip it.
			 */
			const routeId = trainPosition.trip?.routeId;
			const lineCodeMapping = lineMappings.get(routeId as any);
			if (!lineCodeMapping) {
				console.error(
					"Invalid line code mapping:",
					trainPosition.trip.routeId
				);
				continue;
			}

			const line = lines.find(
				(line) => line.lineCode === lineCodeMapping
			);
			if (!line) continue;

			// /**
			//  * There can never be more than one train per trip,
			//  * so we can just get the trip from the static data without double caching.
			//  */
			// const trip = await gtfsStaticModel.getTrip(tpTrip.tripId);
			// if (!trip) continue;

			response.push({
				vehicle: {
					id: tpVehicle.id,
					label: tpVehicle.label,
					stopSequence: tpStopSequence ?? 0,
					latitude: tpPosition.latitude,
					longitude: tpPosition.longitude,
					bearing: Number(tpPosition.bearing),
				},
				line,
				trip: {
					id: tpTrip.tripId,
					routeId: tpTrip.routeId,
					directionId: tpTrip.directionId.toString(),
				},
			});
		}

		return response;
	}

	async getTrainFromTripId(tripId: string): Promise<Train> {
		const gtfsStaticModel = new GTFSStaticModel(this.ctx);
		const gtfsRealtimeModel = new GTFSRealtimeModel(this.ctx);
		const lineModel = new LineModel(this.ctx);
		const trip = await gtfsStaticModel.getTrip(tripId);
		if (!trip) throw new TrainNotFoundError();

		const trainPositions = await gtfsRealtimeModel.getVehiclePositions();
		console.log(trainPositions[0]);
		const trainPosition = trainPositions.find(
			(train) => train.trip.tripId === tripId
		);
		if (!trainPosition) throw new TrainNotFoundError();

		const lineCodeMapping = mappings.rail.routeMappings.get(
			trainPosition.trip.routeId
		);
		if (!lineCodeMapping) throw new Error("Line code mapping not found");

		const line = await lineModel.get(lineCodeMapping);
		if (!line) throw new Error("Line not found");

		return {
			vehicle: trainPosition.vehicle as any,
			line: {
				...line,
				stations: [],
			},
			trip: {
				id: trainPosition.trip.tripId,
				routeId: trainPosition.trip.routeId,
				directionId: trainPosition.trip.directionId.toString(),
			},
		};
	}

	async websocketSendTrainPositions(): Promise<void> {
		const stub = this.ctx.get("trainDataStub");

		const gtfsRealtimeModel = new GTFSRealtimeModel(this.ctx);

		/**
		 * We're using the refreshVehiclePositions() method because the
		 * getVehiclePositions() method is not guaranteed to return the
		 * latest data. (due to KV constraints, expiration is minimum 60 seconds.)
		 */
		const trainPositions =
			await gtfsRealtimeModel.refreshVehiclePositions();

		stub.broadcast({ type: "trainPositions", data: trainPositions });
	}
}

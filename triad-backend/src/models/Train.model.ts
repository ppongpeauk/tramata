/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * 12-22-2024
 */

import { BaseModel } from "./BaseModel.model";
import { Station, StationModel, StationTrainPrediction } from "./Station.model";

/**
 * Type for train predictions with station information
 */
type StationTrainPredictionWithStation = StationTrainPrediction & {
	station?: Station;
};

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
		// Initialize station model and get required data
		const stationModel = new StationModel(this.ctx);
		const [stations, allStationEntrances, nearbyStationEntrances] =
			await Promise.all([
				stationModel.list(),
				stationModel.getAllStationEntrances(),
				stationModel.getNearbyStationEntrances(
					latitude,
					longitude,
					numStations
				),
			]);

		// Get unique station codes from nearby entrances
		const stationCodes = new Set<string>();
		nearbyStationEntrances.forEach((station) => {
			if (station.stationCode1) stationCodes.add(station.stationCode1);
			if (station.stationCode2) stationCodes.add(station.stationCode2);
		});

		// Get predictions for all nearby stations
		const allPredictions = await stationModel.listAllPredictions();
		let predictions = allPredictions.filter((prediction) =>
			stationCodes.has(prediction.locationCode)
		);

		// Filter out "No Passenger" trains
		predictions = predictions.filter(
			(prediction) => prediction.destinationName !== "No Passenger"
		);

		// Custom sort function to handle "ARR" and numeric minutes
		const sortByMinutes = (a: string, b: string) => {
			if (["ARR", "BRD"].includes(a)) return -1;
			if (["ARR", "BRD"].includes(b)) return 1;
			return parseInt(a) - parseInt(b);
		};

		// Sort predictions by arrival time
		predictions.sort(
			(a: StationTrainPrediction, b: StationTrainPrediction) =>
				sortByMinutes(a.min, b.min)
		);

		/**
		 * Map to store unique train predictions
		 * Key: combination of line-station-destination
		 * Value: [prediction with station info, distance from user]
		 */
		const trainPredictions = new Map<
			string,
			[StationTrainPredictionWithStation, number]
		>();

		// Process each prediction
		for (const prediction of predictions) {
			// Find corresponding station entrance
			const stationEntrance = allStationEntrances.find(
				(entrance) =>
					entrance.stationCode1 === prediction.locationCode ||
					entrance.stationCode2 === prediction.locationCode
			);

			if (!stationEntrance) continue;

			// Calculate distance from user to station
			const distance = stationModel.calculateDistance(
				latitude,
				longitude,
				stationEntrance.lat,
				stationEntrance.lon
			);

			// Create unique key for this train
			const key = `${prediction.line}-${prediction.locationCode}-${prediction.destination}`;

			// Add station info to prediction
			const predictionWithStation = {
				...prediction,
				station: stations.find(
					(station) => station.code === prediction.locationCode
				),
			};

			// Update map if this is a new prediction or closer than existing one
			const existingPrediction = trainPredictions.get(key);
			if (!existingPrediction || distance < existingPrediction[1]) {
				trainPredictions.set(key, [predictionWithStation, distance]);
			}
		}

		// Sort predictions by distance and return only the prediction data
		return Array.from(trainPredictions.values())
			.sort((a, b) => a[1] - b[1])
			.map(([prediction, _]) => prediction);
	}
}

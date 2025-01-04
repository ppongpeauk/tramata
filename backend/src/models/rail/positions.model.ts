import { pulseApi } from "@/utils/web";
import { BaseModel } from "../base";
import {
	TrainPosition,
	APITrainPositionResponse,
	TrainPositions,
} from "@/types/train";

import mappings from "@/constants/mappings";

export class TrainPositionModel extends BaseModel {
	async getTrainPositions(): Promise<{ [key: string]: TrainPosition[] }> {
		const url = "https://metroapiprod.azurewebsites.net/api/metro-trains";
		const apiResponse = await pulseApi.get<APITrainPositionResponse>(url, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		// Add error handling and logging
		if (!apiResponse.data || !apiResponse.data.Trains) {
			console.error("No train data received from API");
			return {};
		}

		const data = apiResponse.data.Trains;
		let response = new Map<string, TrainPosition[]>();

		// Log the raw data to debug
		// console.log("Raw train data:", data);

		// Use forEach instead of for...of loops
		Object.entries(data).forEach(([lineCode, trainPositions]) => {
			// Log each line code being processed
			console.log("Processing line code:", lineCode);

			trainPositions.forEach(async (trainPosition) => {
				// Reverse the mapping lookup - look for the short code in values
				const lineMapping = Array.from(
					mappings.rail.routeMappings.entries()
				).find(([key, value]) => value === lineCode)?.[0];

				if (!lineMapping) {
					console.warn(`No mapping found for line code: ${lineCode}`);
					return; // Using return instead of continue for forEach
				}

				if (!response.has(lineMapping)) {
					response.set(lineMapping, []);
				}

				const position = {
					active: trainPosition.isActive,
					currently_holding_or_slow:
						trainPosition.isCurrentlyHoldingOrSlow,
					train_id: trainPosition.TrainId,
					trip_id: trainPosition.TripId,
					car_count: trainPosition.CarCount,
					line_code: trainPosition.LineCode,
					connecting_line_codes: trainPosition.ConnectingLines,
					destination_code: trainPosition.DestinationCode,
					destination_name: trainPosition.DestinationName,
					location_code: trainPosition.LocationCode,
					location_name: trainPosition.LocationName,
					direction_num: trainPosition.DirectionNum,
					vehicle_lat: parseFloat(trainPosition.vehicleLat),
					vehicle_lon: parseFloat(trainPosition.vehicleLon),
					vehicle_bearing: trainPosition.Bearing,
					eta: trainPosition.Min,
				};

				response.get(lineMapping)!.push(position);
			});
		});

		// Log final response size
		console.log("Response map size:", response.size);
		response.forEach((trains, line) => {
			console.log(`Line ${line} has ${trains.length} trains`);
		});

		// Convert map to object
		const responseObject = Object.fromEntries(response);

		return responseObject;
	}
}

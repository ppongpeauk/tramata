import { Stop } from "@/types/stop";
import { BaseModel } from "./base";

import stopData from "@/static/stops.json";
import { PulsePrediction } from "@/types/prediction";
import { pulseApi } from "@/utils/web";
import { OutageModel } from "./rail/outage.model";
import { ParkingModel } from "./rail/parking.model";
import { GTFSModel } from "./rail/gtfs.model";
import { stationCodes } from "@/constants/intersections";

export class StopNotFoundError extends Error {}

export class StopModel extends BaseModel {
	public findAllByAgencyId(agency_id: string, only_parent: boolean) {
		return stopData
			.filter((stop) => stop.agency_id === agency_id)
			.filter((stop) => (only_parent ? stop.location_type === 1 : true));
	}

	public async findByStopId(
		agency_id: string,
		stop_id: string,
		includeArrivals: boolean = false
	) {
		const outageModel = new OutageModel(this.ctx);
		const parkingModel = new ParkingModel(this.ctx);
		const gtfsModel = new GTFSModel(this.ctx);
		const stop = stopData.find(
			(stop) => stop.agency_id === agency_id && stop.stop_id === stop_id
		) as Stop;
		if (!stop) {
			throw new StopNotFoundError();
		}

		if (includeArrivals) {
			stop.predictions = await this.getStopPredictions(stop_id);
		}

		if (stop.agency_id === "WMATA_RAIL") {
			if (stationCodes[stop.stop_id as keyof typeof stationCodes]) {
				const data = await Promise.all(
					stationCodes[stop.stop_id as keyof typeof stationCodes].map(
						(code) => outageModel.findByStationCode(code)
					)
				);
				stop.outages = data.flat();

				/**
				 * Metro Center, Gallery Place, and L'Enfant Plaza do not have parking,
				 * so we set it to undefined (I'm lazy)
				 */
				stop.parking = undefined;
			} else {
				const trimmedStopId = stop.stop_id.replace("STN_", "");
				stop.outages = await outageModel.findByStationCode(
					trimmedStopId
				);
				stop.parking = await parkingModel.findByStationCode(
					trimmedStopId
				);
			}
		}

		return stop;
	}

	public async getStopPredictions(stop_id: string, limit: number = 10) {
		/**
		 * Fetch GTFS predictions for that stop
		 */
		const url = "/metro-train-arrivals?station=";

		const response = await pulseApi.get<PulsePrediction[]>(url + stop_id);

		const formattedPredictions = response.data
			.map((prediction) => ({
				trip_id: prediction.TripId,
				direction_num: prediction.DirectionNum,
				destination_name: prediction.DestinationName,
				location_code: prediction.LocationCode,
				next_location_code: prediction.NextLocationCode,
				car_count: prediction.CarCount,
				train_id: prediction.TrainId,
				line_code: prediction.LineCode,
				is_currently_holding_or_slow:
					prediction.IsCurrentlyHoldingOrSlow,
				min: prediction.Min,
				arrival_time: prediction.ArrivalTime,
				start_time: prediction.StartTime,
				trip_headsign: prediction.TripHeadsign,
				vehicle_lat: prediction.vehicleLat,
				vehicle_lon: prediction.vehicleLon,
				vehicle_bearing: prediction.Bearing,
			}))
			.filter((prediction) => prediction.train_id !== null);

		// Sort predictions by arrival time, prioritizing ARR (arrival) and BRD (boarding)
		formattedPredictions.sort((a, b) => {
			const aTime = new Date(a.arrival_time);
			const bTime = new Date(b.arrival_time);
			const aIsArr = a.line_code === "ARR";
			const bIsArr = b.line_code === "ARR";
			const aIsBrd = a.line_code === "BRD";
			const bIsBrd = b.line_code === "BRD";

			if (aIsArr && !bIsArr) return -1; // a is ARR, b is not
			if (!aIsArr && bIsArr) return 1; // b is ARR, a is not
			if (aIsBrd && !bIsBrd) return -1; // a is BRD, b is not
			if (!aIsBrd && bIsBrd) return 1; // b is BRD, a is not

			return aTime.getTime() - bTime.getTime(); // Sort by arrival time if both are ARR or BRD
		});

		return formattedPredictions;
	}
}

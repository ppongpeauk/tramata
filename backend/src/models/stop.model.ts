import { Stop } from "@/types/stop";
import { BaseModel } from "./base";

import stopData from "@/static/stops.json";
import { GTFSRealtimeModel } from "./gtfs/GTFSRealtime.model";
import { GTFSStaticModel } from "./gtfs/GTFSStatic.model";
import { convertTimeToTimestamp } from "@/utils/gtfs";
import { Prediction } from "@/types/prediction";

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
		const stop = stopData.find(
			(stop) => stop.agency_id === agency_id && stop.stop_id === stop_id
		) as Stop;
		if (!stop) {
			throw new StopNotFoundError();
		}

		if (includeArrivals) {
			stop.predictions = await this.getStopPredictions(stop_id);
		}

		return stop;
	}

	public async getStopPredictions(stop_id: string) {
		/**
		 * Fetch GTFS predictions for that stop
		 */
		const gtfsRealtimeModel = new GTFSRealtimeModel(this.ctx);
		const gtfsStaticModel = new GTFSStaticModel(this.ctx);

		const stopTimes = await gtfsStaticModel.getStopTimes(stop_id);
		let filteredStopTimes = stopTimes
			.filter((stopTime) => stopTime.stop_id === stop_id)
			.map((stopTime) => ({
				...stopTime,
				arrival_time: convertTimeToTimestamp(
					stopTime.arrival_time ?? "00:00:00"
				),
				departure_time: convertTimeToTimestamp(
					stopTime.departure_time ?? "00:00:00"
				),
			}));

		/**
		 * TODO: Merge trip updates with stop times
		 */
		const tripUpdates = await gtfsRealtimeModel.getTripUpdates();
		for (const tripUpdate of tripUpdates) {
			/**
			 * Extract stop time updates that match the stop_id
			 */
			const updates = tripUpdate.stop_time_update
				?.filter((update) => update.stop_id === stop_id)
				.map((update) => ({
					stopSequence: update.stop_sequence,
					arrival: update.arrival?.time ?? undefined,
					departure: update.departure?.time ?? undefined,
				}));
			if (!updates) continue;

			// Now let's replace the stop times with the updates, based on the stop sequence
			filteredStopTimes = filteredStopTimes.map((stopTime) => {
				const update = updates.find(
					(update) => update.stopSequence === stopTime.stop_sequence
				);
				return { ...stopTime, ...update };
			});
		}

		return filteredStopTimes.map(
			(stopTime) =>
				({
					arrivalTime: stopTime.arrival_time,
					departureTime: stopTime.departure_time,
					stopSequence: stopTime.stop_sequence,
					delay: 0,
				} satisfies Prediction)
		);
	}
}

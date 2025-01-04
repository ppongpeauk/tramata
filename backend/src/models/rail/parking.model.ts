import { BaseModel } from "../base";

import { wmataApi } from "@/utils/web";
import { getCachedObject, setCachedObject } from "@/utils/cache";
import { APIParkingResponse, Parking } from "@/types/parking";

export class ParkingModel extends BaseModel {
	async findAll(): Promise<Parking[]> {
		const cached = await getCachedObject(this.ctx, `rail_parking`);
		if (cached) {
			console.log(`Returning cached parking: ${cached.length}`);
			return cached as Parking[];
		}

		console.log("Fetching parking data from WMATA");

		const response = await wmataApi.get<APIParkingResponse>(
			`/Rail.svc/json/jStationParking`,
			{
				headers: {
					api_key: this.ctx.env.WMATA_API_PRIMARY_KEY,
				},
			}
		);

		const parkingData = response.data.StationsParking;

		const parking = parkingData.map(
			(parking) =>
				({
					station_code: parking.Code,
					notes: parking.Notes,
					all_day_parking: {
						total_count: parking.AllDayParking.TotalCount,
						rider_cost: parking.AllDayParking.RiderCost,
						non_rider_cost: parking.AllDayParking.NonRiderCost,
						saturday_rider_cost:
							parking.AllDayParking.SaturdayRiderCost,
						saturday_non_rider_cost:
							parking.AllDayParking.SaturdayNonRiderCost,
					},
					short_term_parking: {
						total_count: parking.ShortTermParking.TotalCount,
						notes: parking.ShortTermParking.Notes,
					},
				} satisfies Parking)
		);

		await setCachedObject(this.ctx, `rail_parking`, parking, 60 * 60 * 1);

		return parking;
	}

	async findByStationCode(stationCode: string): Promise<Parking | undefined> {
		const parking = await this.findAll();
		return parking?.find(
			(parking: Parking) => parking.station_code === stationCode
		);
	}
}

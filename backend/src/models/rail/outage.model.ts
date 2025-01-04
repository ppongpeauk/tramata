import { wmataApi } from "@/utils/web";
import { BaseModel } from "../base";
import { getCachedObject, setCachedObject } from "@/utils/cache";
import { APIOutageResponse, Outage } from "@/types/outage";

export class OutageModel extends BaseModel {
	async findAll(): Promise<Outage[]> {
		const cached = await getCachedObject(this.ctx, `rail_outages`);
		if (cached) {
			console.log(`Returning cached outages: ${cached.length}`);
			return cached as Outage[];
		}

		console.log("Fetching outages from WMATA");

		const response = await wmataApi.get<APIOutageResponse>(
			`/Incidents.svc/json/ElevatorIncidents`,
			{
				headers: {
					api_key: this.ctx.env.WMATA_API_PRIMARY_KEY,
				},
			}
		);

		const outages = response.data.ElevatorIncidents;

		const formattedOutages = outages.map((outage) => {
			return {
				unit_name: outage.UnitName,
				unit_type: outage.UnitType,
				station_code: outage.StationCode,
				station_name: outage.StationName,
				location_description: outage.LocationDescription,
				symptom_description: outage.SymptomDescription,
				date_out_of_serv: outage.DateOutOfServ,
				date_updated: outage.DateUpdated,
				estimated_return_to_service: outage.EstimatedReturnToService,
			} satisfies Outage;
		});

		await setCachedObject(
			this.ctx,
			`rail_outages`,
			formattedOutages,
			60 * 60 * 1
		);

		return formattedOutages;
	}

	async findByStationCode(stationCode: string): Promise<Outage[]> {
		const outages = await this.findAll();
		return outages?.filter(
			(outage: Outage) => outage.station_code === stationCode
		);
	}
}

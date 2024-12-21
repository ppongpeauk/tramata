import { wmataApi } from "@/utils/web";
import { BaseModel } from "./BaseModel.model";
import { getCachedObject, setCachedObject } from "@/utils/cache";

export type APIStation = {
	Code: string;
	Name: string;
	StationTogether1: string;
	StationTogether2: string;
	LineCode1: string;
	LineCode2?: string;
	LineCode3?: string;
	LineCode4?: string;
	Lat: number;
	Lon: number;
	Address: {
		Street: string;
		City: string;
		State: string;
		Zip: string;
	};
};

export type Station = {
	code: string;
	name: string;
	stationTogether1: string;
	stationTogether2: string;
	lineCode1: string;
	lineCode2?: string;
	lineCode3?: string;
	lineCode4?: string;
	lat: number;
	lon: number;
	address: {
		street: string;
		city: string;
		state: string;
		zip: string;
	};
};

export class StationModel extends BaseModel {
	async list(): Promise<Station[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = await getCachedObject(this.ctx, "stations");
		if (cached) {
			return cached as Station[];
		}

		const url = "/Rail.svc/json/jStations";
		const apiResponse = await wmataApi.get(url);
		const apiData = apiResponse.data as { Stations: APIStation[] };

		const response = apiData.Stations.map((station) => ({
			code: station.Code,
			name: station.Name,
			stationTogether1: station.StationTogether1,
			stationTogether2: station.StationTogether2,
			lineCode1: station.LineCode1,
			lineCode2: station.LineCode2,
			lineCode3: station.LineCode3,
			lineCode4: station.LineCode4,
			lat: station.Lat,
			lon: station.Lon,
			address: {
				street: station.Address.Street,
				city: station.Address.City,
				state: station.Address.State,
				zip: station.Address.Zip,
			},
		}));

		await setCachedObject(this.ctx, "stations", response, 60 * 60 * 1);

		return response;
	}

	async get(code: string): Promise<Station | null> {
		const stations = await this.list();
		const station = stations.find((station) => station.code === code);
		if (!station) {
			return null;
		}
		return station;
	}
}

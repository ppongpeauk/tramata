import { wmataApi } from "@/utils/web";
import { BaseModel } from "./BaseModel.model";
import { getCachedObject, setCachedObject } from "@/utils/cache";
import { haversineDistance } from "@/utils/distance";

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
	predictions?: StationTrainPrediction[];
	outages?: StationOutage[];
};

export type APIStationTrainPrediction = {
	Car: string;
	Destination: string;
	DestinationCode: string;
	DestinationName: string;
	Group: string;
	Line: string;
	LocationCode: string;
	LocationName: string;
	Min: string;
};

export type StationTrainPrediction = {
	car: string;
	destination: string;
	destinationCode: string;
	destinationName: string;
	group: string;
	line: string;
	locationCode: string;
	locationName: string;
	min: string;
};

export type APIStationOutage = {
	UnitName: string;
	UnitType: string;
	UnitStatus: string | null;
	StationCode: string;
	StationName: string;
	LocationDescription: string;
	SymptomCode: string | null;
	TimeOutOfService: string;
	SymptomDescription: string;
	DisplayOrder: number;
	DateOutOfServ: string;
	DateUpdated: string;
	EstimatedReturnToService: string;
};

export type StationOutage = {
	unitName: string;
	unitType: "ESCALATOR" | "ELEVATOR";
	unitStatus: string | null;
	stationCode: string;
	stationName: string;
	locationDescription: string;
	symptomCode: string | null;
	timeOutOfService: string;
	symptomDescription: string;
	displayOrder: number;
	dateOutOfServ: string;
	dateUpdated: string;
	estimatedReturnToService: string;
};

export type APIStationEntrance = {
	ID: string;
	Name: string;
	StationCode1: string;
	StationCode2: string;
	Description: string;
	Lat: number;
	Lon: number;
};

export type StationEntrance = {
	id: string;
	name: string;
	stationCode1: string;
	stationCode2: string;
	description: string;
	lat: number;
	lon: number;
};

export class StationNotFoundError extends Error {}

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

	async listAllPredictions(): Promise<StationTrainPrediction[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = await getCachedObject(this.ctx, `rail-predictions-all`);
		if (cached) {
			return cached as StationTrainPrediction[];
		}

		const url = `/StationPrediction.svc/json/GetPrediction/All`;
		const apiResponse = await wmataApi.get(url);
		const apiData = apiResponse.data as {
			Trains: APIStationTrainPrediction[];
		};

		const response = apiData.Trains.map((train) => ({
			car: train.Car,
			destination: train.Destination,
			destinationCode: train.DestinationCode,
			destinationName: train.DestinationName,
			group: train.Group,
			line: train.Line,
			locationCode: train.LocationCode,
			locationName: train.LocationName,
			min: train.Min,
		}));

		await setCachedObject(
			this.ctx,
			`rail-predictions-all`,
			response,
			30 // 30 seconds
		);

		return response;
	}

	async listPredictionsByStationCode(
		code: string
	): Promise<StationTrainPrediction[]> {
		/**
		 * This is used to get predictions for stations with multiple platforms.
		 */
		const relatedStationCodes = new Set<string>();
		relatedStationCodes.add(code);

		const station = await this.get(code, false);
		if (station) {
			if (station.stationTogether1) {
				relatedStationCodes.add(station.stationTogether1);
			}
			if (station.stationTogether2) {
				relatedStationCodes.add(station.stationTogether2);
			}
		} else {
			throw new StationNotFoundError();
		}

		/**
		 * Get all predictions for the related station codes.
		 */
		const allPredictions = await this.listAllPredictions();
		return allPredictions.filter((prediction) =>
			relatedStationCodes.has(prediction.locationCode)
		);
	}

	async listMultiplePredictionsByStationCodes(
		codes: string[]
	): Promise<StationTrainPrediction[]> {
		const allPredictions = await this.listAllPredictions();
		return allPredictions.filter((prediction) =>
			codes.includes(prediction.locationCode)
		);
	}

	async listAllOutages(): Promise<StationOutage[]> {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = await getCachedObject(this.ctx, `rail-outages-all`);
		if (cached) {
			return cached as StationOutage[];
		}

		const url = `/Incidents.svc/json/ElevatorIncidents`;
		const apiResponse = await wmataApi.get(url);
		const apiData = apiResponse.data as {
			ElevatorIncidents: APIStationOutage[];
		};

		const response = apiData.ElevatorIncidents.map((outage) => ({
			unitName: outage.UnitName,
			unitType: outage.UnitType as "ESCALATOR" | "ELEVATOR",
			unitStatus: outage.UnitStatus,
			stationCode: outage.StationCode,
			stationName: outage.StationName,
			locationDescription: outage.LocationDescription,
			symptomCode: outage.SymptomCode,
			timeOutOfService: outage.TimeOutOfService,
			symptomDescription: outage.SymptomDescription,
			displayOrder: outage.DisplayOrder,
			dateOutOfServ: outage.DateOutOfServ,
			dateUpdated: outage.DateUpdated,
			estimatedReturnToService: outage.EstimatedReturnToService,
		}));

		await setCachedObject(
			this.ctx,
			`rail-outages-all`,
			response,
			60 * 15 // 15 minutes
		);

		return response;
	}

	async listOutagesByStationCode(code: string): Promise<StationOutage[]> {
		const allOutages = await this.listAllOutages();
		return allOutages.filter((outage) => outage.stationCode === code);
	}

	async getAllStationEntrances() {
		/**
		 * Check if the data is cached.
		 * If it is, return the cached data.
		 * If it isn't, fetch the data from the API and cache it.
		 */
		const cached = await getCachedObject(
			this.ctx,
			"rail-station-entrances"
		);
		if (cached) {
			return cached as StationEntrance[];
		}
		const apiResponse = await wmataApi.get(
			`/Rail.svc/json/jStationEntrances`
		);
		const apiData = apiResponse.data as {
			Entrances: APIStationEntrance[];
		};

		const response = apiData.Entrances.map((entrance) => ({
			id: entrance.ID,
			name: entrance.Name,
			stationCode1: entrance.StationCode1,
			stationCode2: entrance.StationCode2,
			description: entrance.Description,
			lat: entrance.Lat,
			lon: entrance.Lon,
		}));

		await setCachedObject(
			this.ctx,
			"rail-station-entrances",
			response,
			60 * 60 * 1
		);

		return response;
	}

	/**
	 * Get the nearest station entrances to a given latitude and longitude.
	 * @param latitude - The latitude of the point.
	 * @param longitude - The longitude of the point.
	 * @param n - The number of nearest station entrances to return.
	 * @returns The nearest station entrances to the given latitude and longitude.
	 */
	async getNearbyStationEntrances(
		latitude: number,
		longitude: number,
		n: number = 5
	) {
		const stationModel = new StationModel(this.ctx);
		const stationEntrances = await stationModel.getAllStationEntrances();

		/**
		 * Given a latitude and longitude, find the nearest station entrance.
		 * Then, get the train positions for that station entrance.
		 */
		const nearestStationEntrances = stationEntrances.sort((a, b) => {
			const distanceA = haversineDistance(
				latitude,
				longitude,
				a.lat,
				a.lon
			);
			const distanceB = haversineDistance(
				latitude,
				longitude,
				b.lat,
				b.lon
			);
			return distanceA - distanceB;
		});

		return nearestStationEntrances.slice(0, n);
	}

	async get(
		code: string,
		includePredictions: boolean = true
	): Promise<Station | null> {
		const stations = await this.list();
		let station = stations.find((station) => station.code === code);
		if (!station) {
			return null;
		}

		/**
		 * If includePredictions is true, get the predictions for the station.
		 * Prevent recursive calls to this function.
		 */
		if (includePredictions) {
			const predictions = await this.listPredictionsByStationCode(code);
			station.predictions = predictions;
		}

		/**
		 * Get outages for the station.
		 */
		const outages = await this.listOutagesByStationCode(code);
		station.outages = outages;

		return station;
	}
}

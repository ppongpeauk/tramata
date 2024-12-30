import { BaseModel } from "./BaseModel.model";
import { pulseApi, wmataApi } from "@/utils/web";
import { getCachedObject, setCachedObject } from "@/utils/cache";

/**
 * Static data for WMATA Stations.
 */
import stationsAll from "@/static/api_stations.json";
import stationEntrances from "@/static/api_station_entrances.json";

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
	lines: string[];
	predictions?: StationArrival[];
	outages?: StationOutage[];
	parking?: StationParking;
};

export type StationParking = {
	code: string;
	notes: string | null;
	allDayParking?: {
		totalCount: number;
		riderCost: number;
		nonRiderCost: number;
		saturdayRiderCost: number;
		saturdayNonRiderCost: number;
	};
	shortTermParking?: {
		totalCount: number;
		notes: string;
	};
};

export type StationArrival = {
	tripId: string;

	destinationCode: string;
	destinationName: string;
	headsign: string;

	car: string | number;
	line: string;

	startTime: string;
	min: string | number;

	latitude: number;
	longitude: number;
	bearing: number;
	directionNum: number;
	holdingOrSlow: boolean;
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

export type StationEntrance = {
	id: string;
	name: string;
	stationCode1: string;
	stationCode2: string;
	description: string;
	lat: number;
	lon: number;
};

type APIStation = {
	Code: string;
	Name: string;
	StationTogether1: string;
	StationTogether2: string;
	LineCode1: string;
	LineCode2: string | null;
	LineCode3: string | null;
	LineCode4: string | null;
	Lat: number;
	Lon: number;
	Address: {
		Street: string;
		City: string;
		State: string;
		Zip: string;
	};
};

type APIStationParking = {
	Code: string;
	Notes: string;
	AllDayParking: {
		TotalCount: number;
		RiderCost: number;
		NonRiderCost: number;
		SaturdayRiderCost: number;
		SaturdayNonRiderCost: number;
	};
	ShortTermParking: {
		TotalCount: number;
		Notes: string;
	};
};

type APIStationPrediction = {
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

type APIStationOutage = {
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

type APIStationEntrance = {
	ID: string;
	Name: string;
	StationCode1: string;
	StationCode2: string;
	Description: string;
	Lat: number;
	Lon: number;
};

type PulseAPIArrival = {
	TripId: string;
	DirectionNum: number;
	DestinationName: string;
	LocationCode: string;
	NextLocationCode: string;
	CarCount: string;
	TrainId: string;
	LineCode: string;
	IsCurrentlyHoldingOrSlow: boolean;
	Min: number | string;
	ArrivalTime: number;
	StartTime: string;
	TripHeadsign: string;
	vehicleLat: number;
	vehicleLon: number;
	Bearing: number;
};

export class StationModel extends BaseModel {
	/**
	 * Transform a WMATA station into our station format
	 */
	private transformStation(
		station: APIStation,
		connectedStations: APIStation[] = [],
		parking?: StationParking
	): Station {
		// Collect all line codes from this station and connected stations
		const allLineCodes = new Set<string>();

		// Add line codes from this station
		[
			station.LineCode1,
			station.LineCode2,
			station.LineCode3,
			station.LineCode4,
		]
			.filter((code): code is string => !!code)
			.forEach((code) => allLineCodes.add(code));

		// Add line codes from connected stations
		connectedStations.forEach((connectedStation) => {
			[
				connectedStation.LineCode1,
				connectedStation.LineCode2,
				connectedStation.LineCode3,
				connectedStation.LineCode4,
			]
				.filter((code): code is string => !!code)
				.forEach((code) => allLineCodes.add(code));
		});

		return {
			code: station.Code,
			name: station.Name,
			stationTogether1: station.StationTogether1,
			stationTogether2: station.StationTogether2,
			lineCode1: station.LineCode1,
			lineCode2: station.LineCode2 || undefined,
			lineCode3: station.LineCode3 || undefined,
			lineCode4: station.LineCode4 || undefined,
			lat: station.Lat,
			lon: station.Lon,
			address: {
				street: station.Address.Street,
				city: station.Address.City,
				state: station.Address.State,
				zip: station.Address.Zip,
			},
			lines: Array.from(allLineCodes),
			parking,
		};
	}

	/**
	 * Get a station by code from WMATA API
	 */
	private async getFromApi(code: string): Promise<APIStation | null> {
		try {
			const response = await wmataApi.get(`/Rail.svc/json/jStationInfo`, {
				params: { StationCode: code },
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching station from WMATA:", error);
			return null;
		}
	}

	/**
	 * Get all connected stations for a given station
	 */
	private async getConnectedStations(
		station: APIStation
	): Promise<APIStation[]> {
		const connectedStations: APIStation[] = [];

		// Get stations connected via platform
		const platformCodes = [
			station.StationTogether1,
			station.StationTogether2,
		].filter((code): code is string => !!code);

		// Get all stations from static data
		try {
			const allStations = stationsAll.Stations as APIStation[];

			// Find connected stations
			for (const code of platformCodes) {
				const connectedStation = allStations.find(
					(s) => s.Code === code
				);
				if (connectedStation) {
					connectedStations.push(connectedStation);
				}
			}

			return connectedStations;
		} catch (error) {
			console.error("Error fetching stations for connection:", error);
			return [];
		}
	}

	/**
	 * Get all station entrances
	 */
	async getAllStationEntrances(): Promise<StationEntrance[]> {
		try {
			const entrances =
				stationEntrances.Entrances as APIStationEntrance[];

			const transformed = entrances.map((entrance) => ({
				id: entrance.ID,
				name: entrance.Name,
				stationCode1: entrance.StationCode1,
				stationCode2: entrance.StationCode2,
				description: entrance.Description,
				lat: entrance.Lat,
				lon: entrance.Lon,
			}));

			return transformed;
		} catch (error) {
			console.error("Error fetching station entrances:", error);
			return [];
		}
	}

	/**
	 * Get nearby station entrances
	 */
	async getNearbyStationEntrances(
		latitude: number,
		longitude: number,
		n: number = 5
	): Promise<StationEntrance[]> {
		const entrances = await this.getAllStationEntrances();
		return entrances
			.map((entrance) => ({
				...entrance,
				distance: this.calculateDistance(
					latitude,
					longitude,
					entrance.lat,
					entrance.lon
				),
			}))
			.sort((a, b) => a.distance - b.distance)
			.slice(0, n);
	}

	/**
	 * Calculate distance between two points using Haversine formula
	 */
	calculateDistance(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		const R = 6371e3; // Earth's radius in meters
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	/**
	 * Get all predictions for all stations
	 */
	async listAllPredictions(): Promise<StationArrival[]> {
		const cached = await getCachedObject(this.ctx, "predictions:all");
		if (cached) {
			return cached as StationArrival[];
		}

		try {
			const response = await wmataApi.get(
				"/StationPrediction.svc/json/GetPrediction/All"
			);
			const predictions = response.data.Trains as APIStationPrediction[];

			const transformed = predictions.map(
				(prediction) =>
					({
						tripId: "",
						destinationCode: prediction.DestinationCode,
						destinationName: prediction.DestinationName,
						headsign: prediction.DestinationName,
						car: prediction.Car,
						line: prediction.Line,
						min: prediction.Min,
					} as StationArrival)
			);

			await setCachedObject(this.ctx, "predictions:all", transformed, 60); // Cache for 1 minute
			return transformed;
		} catch (error) {
			console.error("Error fetching train predictions:", error);
			return [];
		}
	}

	/**
	 * Get predictions for a specific station
	 */
	async listPredictionsByStationCode(
		code: string
	): Promise<StationArrival[]> {
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
		}

		// const allPredictions = await this.listAllPredictions();
		// return allPredictions.filter((prediction) =>
		// 	relatedStationCodes.has(prediction.locationCode)
		// );

		let arrivals: PulseAPIArrival[] = [];

		for (const code of relatedStationCodes) {
			console.log(`Fetching arrivals for station ${code}`);
			const pulseAPIArrivals = await pulseApi.get(
				`/metro-train-arrivals?station=${code}`
			);
			arrivals.push(...pulseAPIArrivals.data);
		}

		let transformed = arrivals.map((arrival) => ({
			tripId: arrival.TripId,
			car: arrival.CarCount,
			destinationCode: arrival.LocationCode,
			destinationName: arrival.DestinationName,
			headsign: arrival.DestinationName, // same as destinationName
			line: arrival.LineCode,
			holdingOrSlow: arrival.IsCurrentlyHoldingOrSlow,
			latitude: arrival.vehicleLat,
			longitude: arrival.vehicleLon,
			bearing: arrival.Bearing,
			directionNum: arrival.DirectionNum,
			min: arrival.Min,
			startTime: arrival.StartTime,
		}));

		/**
		 * Omit all arrivals that have a 24hr format set as min,
		 * since they never have an assigned trip ID.
		 */
		transformed = transformed.filter(
			(arrival) =>
				typeof arrival.min === "number" ||
				arrival.min === "ARR" ||
				arrival.min === "BRD"
		);

		/**
		 * Sort arrivals by min.
		 * ARR/BRD first, then min ascending
		 * There are edge cases where min is 24hr format (24:00)
		 */
		transformed.sort((a, b) => {
			if (a.min === "ARR" || a.min === "BRD") return -1;
			if (b.min === "ARR" || b.min === "BRD") return 1;
			if (typeof a.min === "number" && typeof b.min === "number") {
				return a.min - b.min;
			} else {
				/**
				 * Convert 24hr format to minutes
				 */
				const aMin =
					parseInt(a.min.toString().split(":")[0]) * 60 +
					parseInt(a.min.toString().split(":")[1]);
				const bMin =
					parseInt(b.min.toString().split(":")[0]) * 60 +
					parseInt(b.min.toString().split(":")[1]);
				return aMin - bMin;
			}
		});

		return transformed;
	}

	/**
	 * Get all outages
	 */
	async listAllOutages(): Promise<StationOutage[]> {
		const cached = await getCachedObject(this.ctx, "outages:all");
		if (cached) {
			return cached as StationOutage[];
		}

		try {
			const response = await wmataApi.get(
				"/Incidents.svc/json/ElevatorIncidents"
			);
			const outages = response.data
				.ElevatorIncidents as APIStationOutage[];

			const transformed = outages.map((outage) => ({
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
				"outages:all",
				transformed,
				60 * 15
			); // Cache for 15 minutes
			return transformed;
		} catch (error) {
			console.error("Error fetching outages:", error);
			return [];
		}
	}

	/**
	 * Get outages for a specific station
	 */
	async listOutagesByStationCode(code: string): Promise<StationOutage[]> {
		const allOutages = await this.listAllOutages();
		return allOutages.filter((outage) => outage.stationCode === code);
	}

	/**
	 * Get a station by code
	 */
	async get(
		code: string,
		includePredictions: boolean = true
	): Promise<Station | null> {
		// Get from stations list instead of individual API call
		const stations = await this.list();
		const station = stations.find((s) => s.code === code);
		if (!station) return null;

		// Get parking info
		const parking = await this.getParking(code);
		if (parking) {
			station.parking = parking;
		}

		// Add predictions and outages if needed
		if (includePredictions) {
			station.predictions = await this.listPredictionsByStationCode(code);
		}
		station.outages = await this.listOutagesByStationCode(code);

		return station;
	}

	/**
	 * Get all parking information
	 */
	async listAllParking(): Promise<StationParking[]> {
		const cached = await getCachedObject(this.ctx, "parking:all");
		if (cached) {
			return cached as StationParking[];
		}

		try {
			const response = await wmataApi.get(
				"/Rail.svc/json/jStationParking"
			);
			const parkingData = response.data
				.StationsParking as APIStationParking[];

			const transformed = parkingData.map((parking) => ({
				code: parking.Code,
				notes: parking.Notes || null,
				...(parking.AllDayParking && {
					allDayParking: {
						totalCount: parking.AllDayParking.TotalCount,
						riderCost: parking.AllDayParking.RiderCost,
						nonRiderCost: parking.AllDayParking.NonRiderCost,
						saturdayRiderCost:
							parking.AllDayParking.SaturdayRiderCost,
						saturdayNonRiderCost:
							parking.AllDayParking.SaturdayNonRiderCost,
					},
				}),
				...(parking.ShortTermParking && {
					shortTermParking: {
						totalCount: parking.ShortTermParking.TotalCount,
						notes: parking.ShortTermParking.Notes,
					},
				}),
			}));

			await setCachedObject(
				this.ctx,
				"parking:all",
				transformed,
				60 * 60
			); // Cache for 1 hour
			return transformed;
		} catch (error) {
			console.error("Error fetching all station parking:", error);
			return [];
		}
	}

	/**
	 * Get parking information for a station
	 */
	private async getParking(
		code: string
	): Promise<StationParking | undefined> {
		const allParking = await this.listAllParking();
		const parking = allParking.find((p) => p.code === code);
		return parking;
	}

	/**
	 * List all stations
	 */
	async list(deduplicate: boolean = false): Promise<Station[]> {
		try {
			const stations = stationsAll.Stations as APIStation[];

			// Transform and get connected stations for each station
			let transformed = await Promise.all(
				stations.map(async (station) => {
					const connectedStations = await this.getConnectedStations(
						station
					);
					return this.transformStation(station, connectedStations);
				})
			);

			let deduped = new Set<string>();
			if (deduplicate) {
				transformed = transformed.filter((station) =>
					deduped.has(station.name)
						? false
						: deduped.add(station.name)
				);
			}

			return transformed;
		} catch (error) {
			console.error("Error fetching stations from WMATA:", error);
			return [];
		}
	}
}

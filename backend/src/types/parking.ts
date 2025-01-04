export interface APIParkingResponse {
	StationsParking: APIParking[];
}

export interface APIParking {
	Code: string;
	Notes: string | null;
	AllDayParking: {
		TotalCount: number;
		RiderCost: number | null;
		NonRiderCost: number | null;
		SaturdayRiderCost: number | null;
		SaturdayNonRiderCost: number | null;
	};
	ShortTermParking: {
		TotalCount: number;
		Notes: string | null;
	};
}

export interface Parking {
	station_code: string;
	notes: string | null;
	all_day_parking: {
		total_count: number;
		rider_cost: number | null;
		non_rider_cost: number | null;
		saturday_rider_cost: number | null;
		saturday_non_rider_cost: number | null;
	};
	short_term_parking: {
		total_count: number;
		notes: string | null;
	};
}

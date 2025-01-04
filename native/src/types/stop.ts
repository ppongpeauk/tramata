import { Outage } from "./outage";
import { Parking } from "./parking";

export interface StopPrediction {
	trip_id: string;
	direction_num: number;
	destination_name: string;
	location_code: string;
	next_location_code: string;
	car_count: string;
	train_id: string;
	line_code: string;
	is_currently_holding_or_slow: boolean;
	min: number | string;
	arrival_time: number;
	start_time: string;
	trip_headsign: string;
	vehicle_lat: number;
	vehicle_lon: number;
	vehicle_bearing: number;
}

export interface Stop {
	stop_id: string;
	stop_name: string;
	stop_short_name?: string;
	stop_desc: string | null;
	stop_lat: number;
	stop_lon: number;
	zone_id: number;
	location_type: number;
	parent_station: string | null;
	wheelchair_boarding: number;
	level_id: string | null;
	agency_id: string;
	route_ids: string[];
	address?: {
		street: string;
		city: string;
		state: string;
		zip: string;
	};
	predictions: StopPrediction[];
	outages: Outage[];
	parking?: Parking;
}

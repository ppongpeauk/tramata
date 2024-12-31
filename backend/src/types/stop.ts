import { Prediction } from "./prediction";

export interface Stop {
	stop_id: string;
	stop_name: string;
	stop_desc: string | null;
	stop_lat: number;
	stop_lon: number;
	zone_id: number;
	location_type: number;
	parent_station: string | null;
	wheelchair_boarding: number;
	level_id: string | null;
	agency_id: string;

	route_ids?: string[];
	predictions?: Prediction[];
}

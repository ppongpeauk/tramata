import { Alert } from "./alert";
import { Outage } from "./outage";
import { Parking } from "./parking";
import { Prediction } from "./prediction";

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
	address?: {
		street: string;
		city: string;
		state: string;
		zip: string;
	};

	route_ids?: string[];
	predictions?: Prediction[];
	outages?: Outage[];
	parking?: Parking;
}

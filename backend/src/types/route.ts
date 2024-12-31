import { Stop } from "./stop";

export interface Route {
	route_id: string;
	agency_id: string;
	route_short_name: string;
	route_long_name: string;
	route_type: number;
	route_url: string;
	route_color: string;
	as_route: number;
	network_id: string;
	route_text_color: string;

	stops?: Stop[];
}

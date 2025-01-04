import { Station } from "./station";
import { Stop } from "./stop";

export type Line = {
	lineCode: string;
	displayName: string;

	startStationCode: string;
	endStationCode: string;

	startStation?: Station;
	endStation?: Station;

	stations: Station[];

	internalDestination1: string;
	internalDestination2: string;
};

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
	stops: Stop[];
}

import { Route } from "./route";

export interface Agency {
	agency_id: string;
	agency_name: string;
	agency_url: string;
	agency_timezone: string;
	agency_lang: string;
	agency_phone: string;
	agency_fare_url: string;

	routes?: Route[];
}

import { api } from "@/utils/web";
import { Route } from "@/types/route";

export interface APIAgencyResponse {
	agency_id: string;
	agency_name: string;
	agency_url: string;
	agency_timezone: string;
	agency_lang: string;
	agency_phone: string;
	agency_fare_url: string;
	agency_email: string;
	routes: Route[];
}

export async function getLines(): Promise<APIAgencyResponse> {
	const lines = await api.get<APIAgencyResponse>("/v1/agency/WMATA_RAIL");
	// filter out SHUTTLE route
	const data = lines.data;
	data.routes = data.routes.filter((route) => route.route_id !== "SHUTTLE");
	return data;
}

export async function getLine(routeId: string): Promise<Route> {
	const line = await api.get<Route>(
		`/v1/agency/WMATA_RAIL/routes/${routeId}`
	);
	return line.data;
}

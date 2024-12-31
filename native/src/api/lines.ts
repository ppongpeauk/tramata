import { api } from "@/utils/web";
import { Alert } from "./alerts";

export type APILine = {
	lineCode: string;
	displayName: string;
	startStationCode: string;
	endStationCode: string;
	internalDestinations: string[];
	startStation: Station;
	endStation: Station;
	stations: Station[];
	alerts: Alert[];
};

type Station = {
	code: string;
	name: string;
	stationTogether: string[];
	lineCodes: string[];
	lat: number;
	lon: number;
	address: Address;
};

type Address = {
	street: string;
	city: string;
	state: string;
	zip: string;
};

export async function getLines(): Promise<APILine[]> {
	const lines = await api.get("/v1/lines");
	return lines.data;
}

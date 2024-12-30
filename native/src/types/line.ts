import { Station } from "./station";

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

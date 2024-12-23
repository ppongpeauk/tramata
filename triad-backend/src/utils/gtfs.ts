/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * @description Utility functions for working with GTFS data.
 */

import {
	Agency,
	CalendarDates,
	FeedInfo,
	Levels,
	Pathways,
	Route,
	Shapes,
	Stop,
	StopTime,
	Trip,
} from "gtfs-types";
import { ContextHono } from "@/types";
import { wmataApi } from "@/utils/web";
import { unzipSync, strFromU8 } from "fflate";
import Papa from "papaparse";

export enum GTFSFile {
	agency = "agency.txt",
	calendar_dates = "calendar_dates.txt",
	feed_info = "feed_info.txt",
	levels = "levels.txt",
	pathways = "pathways.txt",
	routes = "routes.txt",
	shapes = "shapes.txt",
	stop_times = "stop_times.txt",
	stops = "stops.txt",
	trips = "trips.txt",
}

export type GTFSFileType = {
	agency: Agency[];
	calendar_dates: CalendarDates[];
	feed_info: FeedInfo[];
	levels: Levels[];
	pathways: Pathways[];
	routes: Route[];
	shapes: Shapes[];
	stop_times: StopTime[];
	stops: Stop[];
	trips: Trip[];
};

export type GTFSData = {
	[K in keyof GTFSFileType]: Record<string, GTFSFileType[K]>;
};

/**
 * Download the static GTFS data and return the parsed data as a dictionary of file names to data.
 * @param ctx - The context of the request.
 * @returns A dictionary of file names to data. Data is returned in JSON format.
 */
export async function downloadStaticGtfs({
	ctx,
}: {
	ctx: ContextHono;
}): Promise<GTFSData> {
	console.log("Downloading static GTFS data...");

	const url = "/gtfs/rail-gtfs-static.zip";
	const response = await wmataApi.get(url, {
		responseType: "arraybuffer",
	});

	console.log("Unzipping GTFS data...");

	const buffer = await response.data;
	const uint8Array = new Uint8Array(buffer);
	const unzipped = unzipSync(uint8Array);

	console.log("Parsing GTFS data...");

	const files: Record<string, any> = {};
	for (const [filename, fileData] of Object.entries(unzipped)) {
		const content = strFromU8(fileData);
		const parsed = Papa.parse(content, { header: true });
		files[filename] = parsed.data;
	}

	console.log("GTFS data parsed successfully");

	return files as GTFSData;
}

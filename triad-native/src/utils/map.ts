/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 */

import { Station } from "@/types/station";
import * as FileSystem from "expo-file-system";

const mapUrl =
	"https://www.wmata.com/schedules/maps/images/1080x1312-2023-system-map_1.jpg";
const localMapPath = `${FileSystem.documentDirectory}system-map-rail.jpg`;
const localMetadataPath = `${FileSystem.documentDirectory}system-map-metadata.json`;

export async function fetchAndSaveMap() {
	console.log("Fetching and saving map...");
	// check if local metadata exists
	const localMetadata = await FileSystem.getInfoAsync(localMetadataPath);
	let localLastModified = null;

	if (localMetadata.exists) {
		const metadata = JSON.parse(
			await FileSystem.readAsStringAsync(localMetadataPath)
		);
		localLastModified = metadata.lastModified;
	}

	// fetch the server's last-modified header
	try {
		const response = await fetch(mapUrl, { method: "HEAD" });
		const serverLastModified = response.headers.get("last-modified");

		// compare timestamps to decide if an update is needed
		if (localLastModified === serverLastModified) {
			console.log("Map is up-to-date.");
			return localMapPath;
		}

		// download the new map and update metadata
		console.log("Updating map...");
		await FileSystem.downloadAsync(mapUrl, localMapPath);
		await FileSystem.writeAsStringAsync(
			localMetadataPath,
			JSON.stringify({ lastModified: serverLastModified })
		);

		console.log("Map updated.");
		return localMapPath;
	} catch (error) {
		console.error("Unable to fetch map from WMATA. Using cached map.");
		if (localMetadata.exists) {
			console.log("Using cached map.");
			return localMapPath;
		}
		return null;
	}
}

/**
 * Get the distance between two points on the map in meters.
 * @param lat1 - The latitude of the first point.
 * @param lon1 - The longitude of the first point.
 * @param lat2 - The latitude of the second point.
 * @param lon2 - The longitude of the second point.
 * @returns The distance between the two points in meters.
 */
export function getDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
) {
	const R = 6371000; // Earth's radius in meters
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return d;
}

/**
 * Get the distance between two stations in meters.
 * @param station1 - The first station.
 * @param station2 - The second station.
 * @returns The distance between the two stations in meters.
 */
export function getDistanceBetweenStations(
	station1: Station,
	station2: Station
) {
	return getDistance(station1.lat, station1.lon, station2.lat, station2.lon);
}

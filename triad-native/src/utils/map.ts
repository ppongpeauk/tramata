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

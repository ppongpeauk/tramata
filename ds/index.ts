import axios from "axios";
const lines = ["RD", "SV", "OR", "YL", "BL", "GR"];
const request = "https://api.wmata.com/Rail.svc/json/jStations?LineCode=";
import fs from "fs";
const apiKey = process.env.API_KEY;
if (!apiKey) {
	throw new Error("API_KEY is not set");
}

let stationsByLine: Record<string, string[]> = {};

const getStations = async (line: string) => {
	const response = await axios.get<{
		Stations: {
			Code: string;
			Name: string;
			StationTogether1: string;
			StationTogether2: string;
			LineCode1: string;
			LineCode2: string;
			LineCode3: string;
			LineCode4: string | null;
			Lat: number;
			Lon: number;
			Address: {
				Street: string;
				City: string;
				State: string;
				Zip: string;
			};
		}[];
	}>(request + line, {
		headers: {
			api_key: apiKey,
		},
	});
	stationsByLine[line] = response.data.Stations.map(
		(station) => station.Code
	);
};

for (const line of lines) {
	await getStations(line);
}

// export to JSON
await fs.writeFileSync(
	"stations.json",
	JSON.stringify(stationsByLine, null, 2)
);

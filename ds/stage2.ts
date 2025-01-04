import fs from "fs";

const stations = fs.readFileSync("stations.json", "utf8");
const stationsData = JSON.parse(stations);

const stops = fs.readFileSync("stops.json", "utf8");
const stopsData = JSON.parse(stops);

const routeMappings = {
	RD: "RED",
	BL: "BLUE",
	YL: "YELLOW",
	OR: "ORANGE",
	SV: "SILVER",
	GR: "GREEN",
};

// go through each stop and add a route_ids field
for (const stop of stopsData) {
	if (stop.location_type !== 1) continue;
	let formattedStopIds = stop.stop_id.replace("STN_", "").split("_");
	// get line codes where stop_id is in its array
	const lineCodes = Object.keys(stationsData).filter((line) =>
		formattedStopIds.some((id: string) => stationsData[line].includes(id))
	);
	stop.route_ids = lineCodes.map(
		(line) => routeMappings[line as keyof typeof routeMappings]
	);
}

// export to JSON
fs.writeFileSync("stops-with-routes.json", JSON.stringify(stopsData, null, 2));

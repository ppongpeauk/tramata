import fs from "fs";
import path from "path";

const stops = JSON.parse(fs.readFileSync("stops-with-routes.json", "utf8"));

const apiStations = JSON.parse(
	fs.readFileSync("api-rail-stations.json", "utf8")
);

for (const station of apiStations["Stations"]) {
	// add address to stop
	let stop = stops.find(
		(stop: any) => stop.stop_id === `STN_${station.Code}`
	);
	if (stop) {
		stop.address = {
			street: station.Address.Street,
			city: station.Address.City,
			state: station.Address.State,
			zip: station.Address.Zip,
		};
	}
}

fs.writeFileSync(
	path.join(__dirname, "stops-with-routes-and-address.json"),
	JSON.stringify(stops, null, 2)
);

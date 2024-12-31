import { GenericHono } from "@/types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { FeedMessage, VehiclePosition, Alert } from "@/proto/src/gtfs-realtime";
import { wmataApi } from "@/utils/web";
import { downloadStaticGtfs } from "@/utils/gtfs";
import { GTFSRealtimeModel } from "@/models/gtfs/GTFSRealtime.model";
import { GTFSStaticModel } from "@/models/gtfs/GTFSStatic.model";
const app = new OpenAPIHono<GenericHono>();

const routes = {
	updateStatic: createRoute({
		method: "get",
		path: "/update-static",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	tripUpdates: createRoute({
		method: "get",
		path: "/realtime/trip-updates",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	vehiclePositions: createRoute({
		method: "get",
		path: "/realtime/vehicle-positions",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	alerts: createRoute({
		method: "get",
		path: "/realtime/alerts",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	stops: createRoute({
		method: "get",
		path: "/static/stops",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	clearCache: createRoute({
		method: "get",
		path: "/clear-cache",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	test: createRoute({
		method: "get",
		path: "/test",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
};

app.openapi(routes.updateStatic, async (c) => {
	const gtfsStaticModel = new GTFSStaticModel(c);
	await gtfsStaticModel.refreshStaticData();
	return c.json({ message: "Static GTFS data refreshed." });
});

app.openapi(routes.tripUpdates, async (c) => {
	try {
		const gtfsRealtimeModel = new GTFSRealtimeModel(c);
		const tripUpdates = await gtfsRealtimeModel.getTripUpdates();

		return c.json(tripUpdates);
	} catch (error) {
		console.error("Error fetching WMATA realtime updates:", error);
		return c.json({ error: "Failed to fetch realtime updates" }, 500);
	}
});

app.openapi(routes.vehiclePositions, async (c) => {
	try {
		const gtfsRealtimeModel = new GTFSRealtimeModel(c);
		const vehiclePositions = await gtfsRealtimeModel.getVehiclePositions();

		return c.json(vehiclePositions);
	} catch (error) {
		console.error("Error fetching WMATA vehicle positions:", error);
		return c.json({ error: "Failed to fetch vehicle positions" }, 500);
	}
});

app.openapi(routes.alerts, async (c) => {
	try {
		const gtfsRealtimeModel = new GTFSRealtimeModel(c);
		const alerts = await gtfsRealtimeModel.getAlerts();

		return c.json(alerts);
	} catch (error) {
		console.error("Error fetching WMATA alerts:", error);
		return c.json({ error: "Failed to fetch alerts" }, 500);
	}
});

app.openapi(routes.clearCache, async (c) => {
	const gtfsRealtimeModel = new GTFSRealtimeModel(c);
	const gtfsStaticModel = new GTFSStaticModel(c);
	await gtfsRealtimeModel.clearCache();
	// await gtfsStaticModel.clearCache();

	return c.json({ message: "Cache cleared." });
});

app.openapi(routes.test, async (c) => {
	const trainModel = new TrainModel(c);
	const trains = await trainModel.getTrains();
	return c.json(trains);
});

export default app;

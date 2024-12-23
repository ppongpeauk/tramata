import { GenericHono } from "@/types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { FeedMessage, VehiclePosition, Alert } from "@/proto/src/gtfs-realtime";
import { wmataApi } from "@/utils/web";
import { downloadStaticGtfs } from "@/utils/gtfs";
import { GTFSRealtime } from "@/models/gtfs/GTFSRealtime.model";
import { GTFSStatic } from "@/models/gtfs/GTFSStatic.model";
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
};

app.openapi(routes.updateStatic, async (c) => {
	const files = await downloadStaticGtfs({ ctx: c });
	return c.json(files);
});

app.openapi(routes.tripUpdates, async (c) => {
	try {
		const gtfsRealtimeModel = new GTFSRealtime(c);
		const tripUpdates = await gtfsRealtimeModel.getTripUpdates();

		return c.json(tripUpdates);
	} catch (error) {
		console.error("Error fetching WMATA realtime updates:", error);
		return c.json({ error: "Failed to fetch realtime updates" }, 500);
	}
});

app.openapi(routes.vehiclePositions, async (c) => {
	try {
		const gtfsRealtimeModel = new GTFSRealtime(c);
		const vehiclePositions = await gtfsRealtimeModel.getVehiclePositions();

		return c.json(vehiclePositions);
	} catch (error) {
		console.error("Error fetching WMATA vehicle positions:", error);
		return c.json({ error: "Failed to fetch vehicle positions" }, 500);
	}
});

app.openapi(routes.alerts, async (c) => {
	try {
		const gtfsRealtimeModel = new GTFSRealtime(c);
		const alerts = await gtfsRealtimeModel.getAlerts();

		return c.json(alerts);
	} catch (error) {
		console.error("Error fetching WMATA alerts:", error);
		return c.json({ error: "Failed to fetch alerts" }, 500);
	}
});

app.openapi(routes.stops, async (c) => {
	const gtfsStaticModel = new GTFSStatic(c);
	const stops = await gtfsStaticModel.getFromStaticData("stops");

	return c.json(stops);
});

export default app;

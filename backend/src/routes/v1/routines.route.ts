import { GTFSStaticModel } from "@/models/gtfs/GTFSStatic.model";
import { WebSocketModel } from "@/models/WebSocket.model";
import { GenericHono } from "@/types";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

const app = new OpenAPIHono<GenericHono>();

const routes = {
	broadcastTrainPositions: createRoute({
		method: "post",
		path: "/broadcast/trainPositions",
		description: "Broadcast train positions to all clients",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	gtfsStatic: createRoute({
		method: "post",
		path: "/gtfs/static",
		description: "Refresh GTFS static data",
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
};

app.openapi(routes.broadcastTrainPositions, async (c) => {
	const websocketModel = new WebSocketModel(c);
	await websocketModel.broadcastTrainPositions();
	return c.text(null as any, 204);
});

app.openapi(routes.gtfsStatic, async (c) => {
	const gtfsStaticModel = new GTFSStaticModel(c);
	await gtfsStaticModel.refreshStaticData();
	return c.text(null as any, 204);
});

export default app;

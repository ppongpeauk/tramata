import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "../../types";
import { StationModel } from "@/models/Station.model";
import { TrainModel } from "@/models/Train.model";

const app = new OpenAPIHono<GenericHono>();

const routes = {
	get: createRoute({
		tags: ["trains"],
		summary: "Get train by id",
		method: "get",
		path: "/{id}",
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			200: {
				description: "OK",
				content: {
					"application/json": {
						schema: z.object({
							id: z.string(),
						}),
					},
				},
			},
		},
	}),
	getNearby: createRoute({
		tags: ["trains"],
		summary: "Get nearby trains",
		method: "get",
		path: "/nearby",
		request: {
			query: z.object({
				latitude: z.coerce.number().openapi({ example: 38.8978168 }),
				longitude: z.coerce.number().openapi({ example: -77.0404246 }),
				numStations: z.coerce.number().openapi({ example: 16 }),
			}),
		},
		responses: {
			200: {
				description: "OK",
			},
		},
	}),
};

app.openapi(routes.getNearby, async (c) => {
	const { latitude, longitude, numStations } = c.req.valid("query");
	const trainModel = new TrainModel(c);
	const nearbyTrains = await trainModel.getNearbyTrainPredictions(
		latitude,
		longitude,
		numStations
	);
	return c.json(nearbyTrains, 200);
});

app.openapi(routes.get, async (c) => {
	return c.json({ id: "1" }, 200);
});

export default app;

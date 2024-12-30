import { TrainModel, TrainNotFoundError } from "@/models/Train.model";
import { TripModel } from "@/models/Trip.model";
import { GenericHono } from "@/types";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const app = new OpenAPIHono<GenericHono>();

const routes = {
	getTrip: createRoute({
		method: "get",
		path: "/{tripId}",
		tags: ["trips"],
		request: {
			params: z.object({
				tripId: z.string(),
			}),
		},
		responses: {
			200: {
				description: "Trip found",
				content: {
					"application/json": {
						schema: z.object({
							trip: z.object({
								id: z.string(),
								routeId: z.string(),
								directionId: z.string(),
							}),
							vehicle: z.object({
								id: z.string(),
								latitude: z.number(),
								longitude: z.number(),
								bearing: z.number(),
							}),
							line: z.object({
								lineCode: z.string(),
								displayName: z.string(),
								startStationCode: z.string(),
								endStationCode: z.string(),
								startStation: z
									.object({
										code: z.string(),
										name: z.string(),
									})
									.optional(),
								endStation: z
									.object({
										code: z.string(),
										name: z.string(),
									})
									.optional(),
								internalDestination1: z.string(),
								internalDestination2: z.string(),
							}),
						}),
					},
				},
			},
		},
	}),
};

app.openapi(routes.getTrip, async (c) => {
	const { tripId } = c.req.valid("param");
	const trainModel = new TrainModel(c);
	try {
		const train = await trainModel.getTrainFromTripId(tripId);
		return c.json(train) as any;
	} catch (e) {
		if (e instanceof TrainNotFoundError) {
			return c.json({ error: "Train not found" }, 404);
		}
		throw e;
	}
});

export default app;

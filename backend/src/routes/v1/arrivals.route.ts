import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "@/types";
import { StopModel, StopNotFoundError } from "@/models/stop.model";
const app = new OpenAPIHono<GenericHono>();

app.openapi(
	createRoute({
		method: "get",
		path: "/{agency_id}/stops/{stop_id}/arrivals",
		tags: ["arrivals"],
		request: {
			params: z.object({
				agency_id: z.string(),
				stop_id: z.string(),
			}),
		},
		responses: {
			200: {
				description: "success",
			},
		},
	}),
	async (c) => {
		const { agency_id, stop_id } = c.req.valid("param");
		const stopModel = new StopModel(c);
		try {
			const stop = await stopModel.getStopPredictions(stop_id);
			return c.json(stop);
		} catch (error) {
			if (error instanceof StopNotFoundError) {
				return c.json({ error: "Stop not found" }, 404);
			}
			throw error;
		}
	}
);

export default app;

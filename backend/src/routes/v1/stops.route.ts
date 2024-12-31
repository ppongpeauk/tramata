import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "@/types";
import { StopModel } from "@/models/stop.model";
const app = new OpenAPIHono<GenericHono>();

app.openapi(
	createRoute({
		method: "get",
		path: "/{agency_id}/stops",
		tags: ["stops"],
		description: "Get stops by agency ID.",
		summary: "Get stops by agency ID.",
		request: {
			params: z.object({
				agency_id: z.string().openapi({
					description: "The ID of the agency to get stops for.",
					example: "WMATA_RAIL",
				}),
			}),
			query: z.object({
				only_parent: z.coerce
					.boolean()
					.optional()
					.default(false)
					.openapi({
						description: "Whether to only get parent stops.",
						example: true,
					}),
			}),
		},
		responses: {
			200: {
				description: "Success",
				content: {
					"application/json": {
						schema: z.object({}),
					},
				},
			},
		},
	}),
	async (c) => {
		const { agency_id } = c.req.valid("param");
		const { only_parent } = c.req.valid("query");
		const stopModel = new StopModel(c);
		const stops = stopModel.findAllByAgencyId(agency_id, only_parent);
		return c.json(stops);
	}
);

app.openapi(
	createRoute({
		method: "get",
		path: "/{agency_id}/stops/{stop_id}",
		tags: ["stops"],
		description: "Get a stop by agency ID and stop ID.",
		summary: "Get a stop by agency ID and stop ID.",
		request: {
			params: z.object({
				agency_id: z.string().openapi({
					description: "The ID of the agency to get stops for.",
					example: "WMATA_RAIL",
				}),
				stop_id: z.string().openapi({
					description: "The ID of the stop to get.",
					example: "12345",
				}),
			}),
			query: z.object({
				include_arrivals: z.coerce
					.boolean()
					.optional()
					.default(false)
					.openapi({
						description: "Whether to include arrivals.",
						example: true,
					}),
			}),
		},
		responses: {
			200: {
				description: "Success",
				content: {
					"application/json": {
						schema: z.object({}),
					},
				},
			},
		},
	}),
	async (c) => {
		const { agency_id, stop_id } = c.req.valid("param");
		const { include_arrivals } = c.req.valid("query");
		const stopModel = new StopModel(c);
		const stop = await stopModel.findByStopId(
			agency_id,
			stop_id,
			include_arrivals
		);
		return c.json(stop);
	}
);
export default app;

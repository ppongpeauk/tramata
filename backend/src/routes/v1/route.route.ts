import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "@/types";
import { RouteModel } from "@/models/route.model";

const app = new OpenAPIHono<GenericHono>();

app.openapi(
	createRoute({
		method: "get",
		path: "/{agency_id}/routes/{route_id}",
		tags: ["route"],
		description: "Get a route by ID.",
		summary: "Get a route by ID.",
		request: {
			params: z.object({
				agency_id: z.string().openapi({
					description: "The ID of the agency to get the route for.",
					example: "WMATA_RAIL",
				}),
				route_id: z.string().openapi({
					description: "The ID of the route to get.",
					example: "1",
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
		const routeModel = new RouteModel(c);
		const route = routeModel.findById(c.req.param("route_id"));
		return c.json(route);
	}
);

export default app;

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "../../types";

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
};

app.openapi(routes.get, async (c) => {
	return c.json({ id: "1" }, 200);
});

export default app;

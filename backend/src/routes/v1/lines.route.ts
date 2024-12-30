import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "../../types";
import { Line, LineModel, LineNotFoundError } from "@/models/Line.model";

const app = new OpenAPIHono<GenericHono>();

const routes = {
	list: createRoute({
		method: "get",
		path: "/",
		tags: ["lines"],
		responses: {
			200: {
				description: "List all lines in the system.",
			},
		},
	}),
	get: createRoute({
		method: "get",
		path: "/{lineCode}",
		tags: ["lines"],
		request: {
			params: z.object({
				lineCode: z.string().openapi({ example: "SV" }),
			}),
		},
		responses: {
			200: {
				description: "Get a line by its code.",
			},
			404: {
				description: "Line not found.",
			},
		},
	}),
};

/**
 * @route GET /v1/lines
 * @description List all lines in the system.
 */
app.openapi(routes.list, async (c) => {
	const lineModel = new LineModel(c);
	const lines = await lineModel.list();
	return c.json(lines);
});

/**
 * @route GET /v1/lines/{lineCode}
 * @description Get a line by its code.
 */
app.openapi(routes.get, async (c) => {
	const { lineCode } = c.req.valid("param");
	const lineModel = new LineModel(c);
	try {
		const line = await lineModel.get(lineCode);
		return c.json(line);
	} catch (error) {
		if (error instanceof LineNotFoundError) {
			return c.json({ error: "Line not found." }, 404);
		}
		throw error;
	}
});

export default app;

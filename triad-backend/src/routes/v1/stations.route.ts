import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { StationModel } from "@/models/Station.model";
import { GenericHono } from "@/types";
import { stations } from "@/db/schema";

const app = new OpenAPIHono<GenericHono>();

const routes = {
	get: createRoute({
		tags: ["stations"],
		summary: "Get a station by code",
		method: "get",
		path: "/{code}",
		request: {
			params: z.object({
				code: z.string(),
			}),
		},
		responses: {
			200: {
				description: "Returns a station.",
			},
		},
	}),
};

/**
 * @route GET /v1/stations/{code}
 * @summary Get a station by code
 * @tags stations
 * @param {string} code.path.required - The code of the station
 * @returns {Station} 200 - Station found
 */
app.openapi(routes.get, async (c) => {
	const { code } = c.req.valid("param");
	const stationsModel = new StationModel(c);
	const station = await stationsModel.get(code);
	if (!station) {
		return c.json({ error: "Station not found." }, 404);
	}
	return c.json(station);
});

export default app;

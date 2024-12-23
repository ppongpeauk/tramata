import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { StationModel } from "@/models/Station.model";
import { NavigationModel, NavigationRoute } from "@/models/Navigation.model";
import { GenericHono } from "@/types";
import { stations } from "@/db/schema";

const app = new OpenAPIHono<GenericHono>();

const NavigationResponseSchema = z.object({
	steps: z.array(
		z.object({
			type: z.enum(["RIDE", "TRANSFER", "WALK"]),
			fromStation: z.string(),
			toStation: z.string(),
			line: z.string().optional(),
			duration: z.number(),
			distance: z.number().optional(),
			timeframe: z.object({
				start: z.string(),
				end: z.string(),
			}),
		})
	),
	totalDuration: z.number(),
	totalDistance: z.number(),
	fare: z.object({
		peakTime: z.number(),
		offPeakTime: z.number(),
		seniorDisabled: z.number(),
	}),
});

const ErrorResponseSchema = z.object({
	error: z.string(),
});

const routes = {
	list: createRoute({
		tags: ["stations"],
		summary: "List all stations",
		method: "get",
		path: "/",
		request: {
			query: z.object({
				deduplicate: z.coerce
					.boolean()
					.optional()
					.default(false)
					.openapi({
						example: false,
					})
					.describe(
						"Deduplicate stations by name. Stations with the same name are usually transfer stations."
					),
			}),
		},
		responses: {
			200: {
				description: "Returns a list of stations.",
			},
		},
	}),
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
	getNavigation: createRoute({
		tags: ["stations"],
		summary: "Get navigation directions between two stations",
		method: "get",
		path: "/navigation/{fromCode}/{toCode}",
		request: {
			params: z.object({
				fromCode: z.string(),
				toCode: z.string(),
			}),
		},
		responses: {
			200: {
				description: "Returns navigation directions between stations.",
				content: {
					"application/json": {
						schema: NavigationResponseSchema,
					},
				},
			},
			400: {
				description: "Invalid station codes or no path found.",
				content: {
					"application/json": {
						schema: ErrorResponseSchema,
					},
				},
			},
		},
	}),
};

/**
 * @route GET /v1/stations
 * @summary List all stations
 * @tags stations
 * @returns {Station[]} 200 - List of stations
 */
app.openapi(routes.list, async (c) => {
	const { deduplicate } = c.req.query();
	const stationsModel = new StationModel(c);
	const stations = await stationsModel.list(deduplicate === "true");
	return c.json(stations);
});

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

type NavigationResponse = z.infer<typeof NavigationResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

app.openapi(routes.getNavigation, async (c) => {
	const { fromCode, toCode } = c.req.valid("param");
	const navigationModel = new NavigationModel(c);

	try {
		const route = await navigationModel.calculateRoute(fromCode, toCode);
		return c.json(route satisfies NavigationResponse, 200);
	} catch (error: any) {
		const errorResponse: ErrorResponse = {
			error: error.message || "Navigation calculation failed",
		};
		return c.json(errorResponse, 400);
	}
});

export default app;

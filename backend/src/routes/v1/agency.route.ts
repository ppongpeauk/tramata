import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "@/types";
import { AgencyModel, AgencyNotFoundError } from "@/models/agency.model";

const app = new OpenAPIHono<GenericHono>();

app.openapi(
	createRoute({
		method: "get",
		path: "/",
		tags: ["agency"],
		description: "List all agencies.",
		summary: "List all agencies.",
		responses: {
			200: {
				description: "Success",
				content: {
					"application/json": {
						schema: z.array(
							z.object({
								agency_id: z.string(),
								agency_name: z.string(),
								agency_url: z.string(),
								agency_timezone: z.string(),
								agency_lang: z.string(),
								agency_phone: z.string(),
								agency_fare_url: z.string(),
								agency_email: z.string(),
							})
						),
					},
				},
			},
		},
	}),
	async (c) => {
		const agencyModel = new AgencyModel(c);
		const agencies = agencyModel.findAll();
		return c.json(agencies);
	}
);

app.openapi(
	createRoute({
		method: "get",
		path: "/{agency_id}",
		tags: ["agency"],
		description: "Get an agency and its routes.",
		summary: "Get an agency and its routes.",
		request: {
			params: z.object({
				agency_id: z.string().openapi({
					description: "The ID of the agency to get.",
					example: "WMATA_RAIL",
				}),
			}),
		},
		responses: {
			200: {
				description: "Success",
			},
		},
	}),
	async (c) => {
		const { agency_id } = c.req.valid("param");
		const agencyModel = new AgencyModel(c);
		try {
			const agency = await agencyModel.findById(agency_id);
			return c.json(agency);
		} catch (error) {
			if (error instanceof AgencyNotFoundError) {
				return c.json({ error: error.message }, 404);
			}
			throw error;
		}
	}
);

export default app;

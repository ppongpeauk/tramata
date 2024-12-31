import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "@/types";
import { AlertModel } from "@/models/Alert.model";

const app = new OpenAPIHono<GenericHono>();

const routes = {
	list: createRoute({
		tags: ["alerts"],
		summary: "List all alerts",
		method: "get",
		path: "/",
		responses: {
			200: {
				description: "Returns a list of alerts.",
			},
		},
	}),
	getByLineCode: createRoute({
		tags: ["alerts"],
		summary: "Get an alert by line code",
		method: "get",
		path: "/{lineCode}",
		request: {
			params: z.object({
				lineCode: z.string(),
			}),
		},
		responses: {
			200: {
				description: "Returns an alert.",
			},
			404: {
				description: "Alert not found.",
			},
		},
	}),
};

/**
 * @route GET /v1/alerts
 * @summary List all alerts
 * @tags alerts
 * @returns {APIAlert[]} 200 - List of alerts
 */
app.openapi(routes.list, async (c) => {
	const alertModel = new AlertModel(c);
	const alerts = await alertModel.list();
	return c.json(alerts);
});

/**
 * @route GET /v1/alerts/{lineCode}
 * @summary Get an alert by line code
 * @tags alerts
 * @param {string} lineCode.path.required - The line code of the alert
 * @returns {APIAlert} 200 - Alert found
 * @returns {ErrorResponse} 404 - Alert not found
 */
app.openapi(routes.getByLineCode, async (c) => {
	const { lineCode } = c.req.valid("param");
	const alertModel = new AlertModel(c);
	const alerts = await alertModel.listByLineCode(lineCode);
	if (!alerts) {
		return c.json({ error: "Alert not found." }, 404);
	}
	return c.json(alerts);
});

export default app;

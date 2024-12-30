import { OpenAPIHono, z } from "@hono/zod-openapi";
import { SwaggerUI, swaggerUI } from "@hono/swagger-ui";
import { GenericHono } from "./types";
import { apiReference } from "@scalar/hono-api-reference";

import v1 from "./routes/v1";
import {
	axiosMiddleware,
	dbMiddleware,
	trainDataMiddleware,
} from "./middleware";
import { TrainData } from "@/durableObjects/websocket";
import v2 from "./routes/v2";
import { WorkerEntrypoint } from "cloudflare:workers";
import { scheduled } from "./utils/cronjobs";

const app = new OpenAPIHono<GenericHono>();

/**
 * Middleware to set up the WMATA API key
 */
app.use(axiosMiddleware);

/**
 * Middleware to set up the database
 */
app.use(dbMiddleware);

/**
 * Middleware to set up the train data
 */
app.use(trainDataMiddleware);

app.route("/v1", v1);
app.route("/v2", v2);

/**
 * Documentation
 */
app.doc("/openapi", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "Hypermata Documentation",
	},
});
app.get(
	"/",
	swaggerUI({
		url: "/openapi",
	})
);

export { TrainData };
export default {
	fetch: app.fetch,
	scheduled,
} as WorkerEntrypoint;

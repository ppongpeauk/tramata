import { OpenAPIHono, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { GenericHono } from "./types";

import v1 from "./routes/v1";
import {
	axiosMiddleware,
	dbMiddleware,
	trainDataMiddleware,
} from "./middleware";
import { TrainData } from "@/durableObjects/websocket";

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

/**
 * Documentation
 */
app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "Tramata Documentation",
	},
});
app.use(
	"/",
	swaggerUI({
		url: "/doc",
	})
);
app.use(
	"/docs/wmata",
	swaggerUI({
		url: "https://raw.githubusercontent.com/APIs-guru/openapi-directory/refs/heads/main/APIs/wmata.com/rail-realtime/1.0/swagger.yaml",
	})
);

export { TrainData };
export default app;

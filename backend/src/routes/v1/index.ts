import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GenericHono } from "@/types";

import trains from "./trains.route";
import lines from "./lines.route";
import stations from "./stations.route";
import routines from "./routines.route";
import trips from "./trips.route";
import alerts from "./alerts.route";
const app = new OpenAPIHono<GenericHono>();

app.route("/trains", trains);
app.route("/lines", lines);
app.route("/stations", stations);
app.route("/routines", routines);
app.route("/trips", trips);
app.route("/alerts", alerts);
app.openapi(
	createRoute({
		method: "get",
		path: "/ws",
		description: "Get a websocket connection to the server.",
		tags: ["websocket"],
		responses: {
			101: {
				description: "Switching protocols.",
			},
			426: {
				description: "Not a websocket request.",
			},
		},
	}),
	async (c) => {
		if (c.req.header("upgrade") !== "websocket") {
			return c.text("Not a websocket request.", 426);
		}

		const trainDataStub = c.get("trainDataStub");
		return trainDataStub.fetch(c.req.raw);
	}
);

app.openapi(
	createRoute({
		method: "post",
		path: "/test",
		description: "Test the websocket connection.",
		tags: ["websocket"],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								example: "This is a test message.",
								description:
									"The message to send to the server.",
							}),
						}),
					},
				},
			},
		},
		responses: {
			200: {
				description: "Success.",
			},
		},
	}),
	async (c) => {
		const { message } = await c.req.json();
		const trainDataStub = c.get("trainDataStub");
		await trainDataStub.broadcast("test", message);
		return c.text(null as any, 204);
	}
);

export default app;

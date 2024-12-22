import { OpenAPIHono } from "@hono/zod-openapi";
import { EventData, GenericHono } from "@/types";
import { upgradeWebSocket } from "hono/cloudflare-workers";

import trains from "./trains.route";
import lines from "./lines.route";
import stations from "./stations.route";
import { TrainData } from "@/durableObjects/websocket";

const app = new OpenAPIHono<GenericHono>();

app.route("/trains", trains);
app.route("/lines", lines);
app.route("/stations", stations);

app.get("/ws", async (c) => {
	if (c.req.header("upgrade") !== "websocket") {
		return c.text("Expected Upgrade: websocket", 426);
	}
	const trainDataStub = c.get(
		"trainDataStub"
	) as DurableObjectStub<TrainData>;
	return trainDataStub.fetch(c.req.raw);
});
// app.get(
// 	"/ws",
// 	upgradeWebSocket(async (c) => {
// 		const trainDataStub = c.get("trainDataStub");
// 		return {
// 			async onMessage(event, ws) {
// 				console.log(`Message from client: ${event.data}`);
// 				await trainDataStub.addConnection(ws);
// 			},
// 			async onClose(event, ws) {
// 				await trainDataStub.removeConnection(ws);
// 			},
// 		};
// 	})
// );

app.get("/test", async (c) => {
	const trainDataStub = c.get("trainDataStub");
	await trainDataStub.broadcast("balls");
	return c.json({ type: "data", data: "Hello from server!" });
});

export default app;

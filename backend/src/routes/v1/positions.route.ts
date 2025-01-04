import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { GenericHono } from "@/types";
import { TrainPositionModel } from "@/models/rail/positions.model";
const app = new OpenAPIHono<GenericHono>();

app.openapi(
	createRoute({
		method: "get",
		path: "/",
		summary: "Get train positions",
		description: "Get train positions",
		tags: ["positions"],
		responses: {
			200: { description: "OK" },
		},
	}),
	async (c) => {
		const model = new TrainPositionModel(c);
		const positions = await model.getTrainPositions();
		return c.json(positions);
	}
);

export default app;

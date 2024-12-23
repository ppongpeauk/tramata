import { GenericHono } from "@/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import gtfsRoute from "./gtfs.route";

const app = new OpenAPIHono<GenericHono>();

app.route("/gtfs", gtfsRoute);

export default app;

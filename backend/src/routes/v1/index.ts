import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { GenericHono } from "@/types";

import agencyRoute from "./agency.route";
import stopsRoute from "./stops.route";
import routeRoute from "./route.route";
import arrivalsRoute from "./arrivals.route";
import { TrainPositionModel } from "@/models/rail/positions.model";
import positionsRoute from "./positions.route";

const app = new OpenAPIHono<GenericHono>();

app.route("/agency", agencyRoute);
app.route("/agency/WMATA_RAIL/positions", positionsRoute);
app.route("/stops", stopsRoute);
app.route("/arrivals", arrivalsRoute);

export default app;

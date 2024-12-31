import { OpenAPIHono } from "@hono/zod-openapi";
import { GenericHono } from "@/types";

import agencyRoute from "./agency.route";
import stopsRoute from "./stops.route";
import routeRoute from "./route.route";
import arrivalsRoute from "./arrivals.route";

const app = new OpenAPIHono<GenericHono>();

app.route("/agency", agencyRoute);
app.route("/stops", stopsRoute);
app.route("/route", routeRoute);
app.route("/arrivals", arrivalsRoute);

export default app;

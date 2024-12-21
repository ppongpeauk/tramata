import { OpenAPIHono } from "@hono/zod-openapi";
import { GenericHono } from "@/types";

import trains from "./trains.route";
import lines from "./lines.route";
import stations from "./stations.route";

const app = new OpenAPIHono<GenericHono>();

app.route("/trains", trains);
app.route("/lines", lines);
app.route("/stations", stations);
export default app;

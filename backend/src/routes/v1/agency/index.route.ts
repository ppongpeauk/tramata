import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { GenericHono } from "@/types";

const app = new OpenAPIHono<GenericHono>();

const routes = {};

export default app;

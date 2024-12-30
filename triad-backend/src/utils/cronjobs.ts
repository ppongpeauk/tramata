import { GTFSRealtimeModel } from "@/models/gtfs/GTFSRealtime.model";
import { GenericHono } from "@/types";
import { OpenAPIHono } from "@hono/zod-openapi";

export async function scheduled(
	event: ScheduledEvent,
	env: GenericHono["Bindings"],
	ctx: ExecutionContext
) {
	const app = new OpenAPIHono();

	switch (event.cron) {
		case "*/1 * * * *":
			app.request("/v1/routines/broadcast/trainPositions", {}, env);
			break;
		case "0 4,16 * * *":
			/**
			 * Every day at 4am and 4pm.
			 *
			 * - Fetch, parse, and store GTFS static data
			 */
			app.request("/v1/routines/gtfs/static", {}, env);
			break;
		default:
			console.log("Unknown cronjob");
			break;
	}
}

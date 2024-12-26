import { GenericHono } from "@/types";

export async function scheduled(
	event: ScheduledEvent,
	env: GenericHono["Variables"],
	ctx: ExecutionContext
) {
	switch (event.cron) {
		case "*/1 * * * *":
			console.log("Hello from cronjob!");
			break;
		case "0 4,16 * * *":
			/**
			 * Every day at 4am and 4pm.
			 *
			 * - Fetch, parse, and store GTFS static data
			 */
			console.log("Hello from cronjob!");
			break;
		default:
			console.log("Unknown cronjob");
			break;
	}
}

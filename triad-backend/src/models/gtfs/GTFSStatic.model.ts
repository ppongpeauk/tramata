import { BaseModel } from "../BaseModel.model";
import { downloadStaticGtfs, GTFSFile } from "@/utils/gtfs";
import { getCachedObject, setCachedObject } from "@/utils/cache";
export class GTFSStatic extends BaseModel {
	async getStaticData(): Promise<Record<keyof typeof GTFSFile, any>> {
		/**
		 * Get the cached data.
		 */
		const cachedData = (await getCachedObject(
			this.ctx,
			"gtfs_static"
		)) as Record<keyof typeof GTFSFile, any>;

		if (cachedData) {
			return cachedData;
		}

		/**
		 * If the data is not cached or expired, download the static GTFS data.
		 * Data is returned in JSON format.
		 */
		const response = await downloadStaticGtfs({ ctx: this.ctx });

		/**
		 * Update the database with the new data.
		 */
		await setCachedObject(
			this.ctx,
			"gtfs_static",
			response,
			1000 * 60 * 60 * 24 * 1
		);

		return response;
	}

	async getFromStaticData(key: keyof typeof GTFSFile): Promise<any> {
		const staticData = await this.getStaticData();
		return staticData[key];
	}
}

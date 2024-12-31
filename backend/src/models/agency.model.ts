import { wmataApi } from "@/utils/web";
import { BaseModel } from "./base";

import agencyData from "@/static/agency.json";

export class AgencyModel extends BaseModel {
	async list() {
		return agencyData;
	}
}

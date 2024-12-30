import { ContextHono } from "@/types";

export class BaseModel {
	constructor(public ctx: ContextHono) {
		this.ctx = ctx;
	}
}

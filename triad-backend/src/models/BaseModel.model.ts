import { ContextHono } from "@/types";
import { Context } from "hono";

export class BaseModel {
	constructor(public ctx: ContextHono) {
		this.ctx = ctx;
	}
}

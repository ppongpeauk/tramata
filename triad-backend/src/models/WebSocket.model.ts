import { TrainData } from "@/durableObjects/websocket";
import { BaseModel } from "./BaseModel.model";
import { ContextHono } from "@/types";
import { GTFSRealtimeModel } from "./gtfs/GTFSRealtime.model";

export class WebSocketModel extends BaseModel {
	private stub: DurableObjectStub<TrainData>;

	constructor(ctx: ContextHono) {
		super(ctx);
		this.stub = ctx.get("trainDataStub");
	}

	public async broadcastTrainPositions() {
		const gtfsRealtimeModel = new GTFSRealtimeModel(this.ctx);
		const trainPositions = await gtfsRealtimeModel.getVehiclePositions();
		await this.stub.broadcast("trainPositions", trainPositions);
	}
}

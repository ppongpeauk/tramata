import { BaseModel } from "./BaseModel.model";

export type Trip = {
	id: string;
	directionId: number;
	trainId: string;
};

export class TripModel extends BaseModel {}

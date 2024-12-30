import { Line } from "./line";

export type Train = {
	vehicle: {
		id: string;
		label: string;

		stopSequence: number;

		latitude: number;
		longitude: number;
		bearing: number;
	};
	line: Line;
	trip: {
		id: string;
		routeId: string;
		directionId: string;
	};
};

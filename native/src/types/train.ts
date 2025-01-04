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

export interface TrainPositions {
	[key: string]: TrainPosition[];
}

export interface TrainPosition {
	active: boolean;
	currently_holding_or_slow: boolean;
	train_id: string;
	trip_id: string | null;

	car_count: number | string;
	line_code: string;
	connecting_line_codes: string[];

	destination_code: string;
	destination_name: string;

	location_code: string;
	location_name: string;

	eta: number | string;

	direction_num: number;
	vehicle_lat: number;
	vehicle_lon: number;
	vehicle_bearing: number;
}

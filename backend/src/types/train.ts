export type APITrainPositionResponse = {
	Trains: Record<string, APITrainPosition[]>;
};

export interface APITrainPosition {
	isActive: boolean;
	isCurrentlyHoldingOrSlow: boolean;
	TrainId: string;
	DirectionNum: number;
	Car: string;
	CarCount: string;
	LineCode: string;
	ConnectingLines: string[];
	DestinationCode: string;
	DestinationName: string;
	DestinationShortName: string;
	LocationCode: string;
	LocationName: string;
	PreviousLocationCode: string;
	PreviousLocationName: string;
	NextLocationCode: string;
	NextLocationName: string;
	StartTime: string;
	TripId: string;
	ArrivalTime: number;
	Min: string;
	TrainStatus: number;
	StopSequence: number;
	vehicleLat: string;
	vehicleLon: string;
	Bearing: number;
}

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

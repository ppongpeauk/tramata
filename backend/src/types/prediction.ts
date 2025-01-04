export interface Prediction {
	trip_id: string;
	direction_num: number;
	destination_name: string;
	location_code: string;
	next_location_code: string;
	car_count: number;
	train_id: string;
	line_code: string;
	is_currently_holding_or_slow: boolean;
	min: number;
	arrival_time: Date;
	start_time: string;
	trip_headsign: string;
	vehicle_lat: number;
	vehicle_lon: number;
	vehicle_bearing: number;
}

export interface PulsePrediction {
	TripId: string;
	DirectionNum: number;
	DestinationName: string;
	LocationCode: string;
	NextLocationCode: string;
	CarCount: number;
	TrainId: string;
	LineCode: string;
	IsCurrentlyHoldingOrSlow: boolean;
	Min: number;
	ArrivalTime: Date;
	StartTime: string;
	TripHeadsign: string;
	vehicleLat: number;
	vehicleLon: number;
	Bearing: number;
}

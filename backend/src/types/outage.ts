export interface APIOutageResponse {
	ElevatorIncidents: APIOutage[];
}

export interface APIOutage {
	UnitName: string;
	UnitType: string;
	UnitStatus: string | null;
	StationCode: string;
	StationName: string;
	LocationDescription: string;
	SymptomCode: string | null;
	TimeOutOfService: string;
	SymptomDescription: string;
	DisplayOrder: number;
	DateOutOfServ: string; // ISO 8601 format
	DateUpdated: string; // ISO 8601 format
	EstimatedReturnToService: string; // ISO 8601 format
}

export interface Outage {
	unit_name: string;
	unit_type: string;
	station_code: string;
	station_name: string;
	location_description: string;
	symptom_description: string;
	date_out_of_serv: string;
	date_updated: string;
	estimated_return_to_service: string;
}

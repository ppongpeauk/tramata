export type StationParking = {
	code: string;
	notes: string | null;
	allDayParking?: {
		totalCount: number;
		riderCost: number;
		nonRiderCost: number;
		saturdayRiderCost: number;
		saturdayNonRiderCost: number;
	};
	shortTermParking?: {
		totalCount: number;
		notes: string;
	};
};

export type Station = {
	code: string;
	name: string;
	lat: number;
	lon: number;
	lineCode1: string;
	lineCode2: string;
	lineCode3: string;
	lineCode4: string;
	address: {
		street: string;
		city: string;
		state: string;
		zip: string;
	};
	outages?: StationOutage[];
	predictions?: StationTrainPrediction[];
	lines: string[];
	parking?: StationParking;
};

export type StationTrainPrediction = {
	car: string;
	destination: string;
	destinationCode: string;
	destinationName: string;
	group: string;
	line: string;
	locationCode: string;
	locationName: string;
	min: string;
};

export type StationOutage = {
	unitName: string;
	unitType: "ESCALATOR" | "ELEVATOR";
	unitStatus: string | null;
	stationCode: string;
	stationName: string;
	locationDescription: string;
	symptomCode: string | null;
	timeOutOfService: string;
	symptomDescription: string;
	displayOrder: number;
	dateOutOfServ: string;
	dateUpdated: string;
	estimatedReturnToService: string;
};

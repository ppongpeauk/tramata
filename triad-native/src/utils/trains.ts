import { StationTrainPrediction } from "@/types/station";
import { api } from "./web";

export async function getNearbyTrains(
	lat: number,
	lon: number
): Promise<StationTrainPrediction[]> {
	const response = await api.get(
		"/v1/trains/nearby?latitude=" +
			lat +
			"&longitude=" +
			lon +
			"&numStations=16"
	);
	return response.data;
}

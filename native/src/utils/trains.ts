import { api } from "./web";

export async function getTrainPositions() {
	const response = await api.get(`/v1/agency/WMATA_RAIL/positions`);
	return response.data;
}

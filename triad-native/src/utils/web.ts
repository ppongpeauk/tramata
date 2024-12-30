import axios from "axios";
export const baseURL = "http://localhost:8787";
// export const baseURL = "https://triad-backend.ppkl.workers.dev";
export const wsURL = `ws://${baseURL}/v1/ws`;

export const api = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

import axios from "axios";
export const baseURL = "http://localhost:8787";
// export const baseURL = "https://triad-backend.ppkl.workers.dev";
// export const wsURL = `ws://localhost:8787/v1/ws`;
export const wsURL = `wss://triad-backend.ppkl.workers.dev/v1/ws`;
export const api = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

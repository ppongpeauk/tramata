import axios from "axios";
export const baseURL = "localhost:8787";
// export const baseURL = "triad-backend.ppkl.workers.dev";
export const wsURL = `ws://${baseURL}/v1/ws`;

export const api = axios.create({
	baseURL: `http://localhost:8787`,
	headers: {
		"Content-Type": "application/json",
	},
});

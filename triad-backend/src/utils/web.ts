import axios from "axios";

export const wmataApi = axios.create({
	baseURL: "https://api.wmata.com",
});

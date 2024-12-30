import axios from "axios";

export const wmataApi = axios.create({
	baseURL: "https://api.wmata.com",
});

export const pulseApi = axios.create({
	baseURL: "https://metroapiprod.azurewebsites.net/api",
});

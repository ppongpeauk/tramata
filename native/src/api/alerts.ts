import { api } from "@/utils/web";

export type Alert = {
	lineCodes: string[];
	message: string;
	createdAt: Date;
	updatedAt: Date;
};

export async function listAlerts(): Promise<Alert[]> {
	const alerts = await api.get("/v1/alerts");
	return alerts.data;
}

export async function getAlertByLineCode(lineCode: string): Promise<Alert[]> {
	const alert = await api.get(`/v1/alerts/${lineCode}`);
	return alert.data;
}

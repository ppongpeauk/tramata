export interface Alert {
	route_ids: string[];
	stop_ids: string[];
	cause?: number;
	effect?: number;
	header_text?: string;
	description_text?: string;
	severity?: number;
	url?: string;
}

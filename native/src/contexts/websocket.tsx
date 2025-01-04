import { wsURL } from "@/utils/web";
import React, { createContext, useContext, useEffect, useState } from "react";

const TrainWebsocketContext = createContext<TrainWebsocketContextType | null>(
	null
);

export type TrainWebsocketContextType = {
	trainPositions: TrainPosition[];
};

export type EventData = {
	type: "connection" | "trainPositions";
	data: any;
};

export type TrainPosition = {
	trip: {
		tripId: string;
		routeId: string;
		directionId: number;
		startTime: string;
		startDate: string;
		scheduleRelationship: number;
	};
	vehicle: {
		id: string;
		label: string;
		licensePlate: string;
		wheelchairAccessible: number;
	};
	position: {
		latitude: number;
		longitude: number;
		bearing: number;
		odometer: number;
		speed: number;
	};
	currentStopSequence: number;
	stopId: string;
	currentStatus: number;
	timestamp: number;
	congestionLevel: number;
	occupancyStatus: number;
	occupancyPercentage: number;
	multiCarriageDetails: any[];
};

export const TrainWebsocketProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [websocket, setWebsocket] = useState<WebSocket | null>(null);
	const [trainPositions, setTrainPositions] = useState<TrainPosition[]>([]);

	const connectWebSocket = () => {
		const ws = new WebSocket(wsURL);
		console.log("Connecting to WebSocket...");
		setWebsocket(ws);

		ws.onopen = () => {
			console.log("WebSocket connection established");
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data) as EventData;
			// console.log("Received message", data);
			if (data.type === "trainPositions") {
				console.log(`Received ${data.data.length} train positions.`);
				setTrainPositions(data.data ?? []);
			}
		};

		ws.onerror = (error) => {
			console.debug("WebSocket error:", error);
		};

		ws.onclose = () => {
			console.log(
				"WebSocket connection closed. Attempting to reconnect..."
			);
			setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
		};
	};

	useEffect(() => {
		// connectWebSocket(); // Initial connection
	}, []);

	return (
		<TrainWebsocketContext.Provider value={{ trainPositions }}>
			{children}
		</TrainWebsocketContext.Provider>
	);
};

export const useTrainWebsocket = () => {
	return useContext(TrainWebsocketContext);
};

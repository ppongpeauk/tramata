import { wsURL } from "@/utils/web";
import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

const TrainWebsocketContext = createContext<TrainWebsocketContextType | null>(
	null
);

export type TrainWebsocketContextType = {
	trainData: any;
	isConnected: boolean;
};

export type EventData = {
	type: "connection" | "data";
	data: any;
};

export const TrainWebsocketProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const webSocket = useRef<WebSocket | null>(null);
	const [trainData, setTrainData] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [reconnectDelay, setReconnectDelay] = useState(1000); // Initial delay of 1 second

	const connectWebSocket = async () => {
		// const ws = new WebSocket(wsURL);
		// webSocket.current = ws;
		// ws.onopen = () => {
		// 	setIsConnected(true);
		// 	console.log("Established a websocket connection to the server");
		// 	setReconnectDelay(1000); // Reset delay on successful connection
		// 	/**
		// 	 * As of 12-22-2024, CF Workers doesn't support the onOpen event.
		// 	 * We need to send a message to the server so that it knows we're connected.
		// 	 */
		// 	ws.send(JSON.stringify({ type: "connection", data: "connected" }));
		// };
		// ws.onmessage = (event) => {
		// 	console.log("Received message", event.data);
		// 	const data = JSON.parse(event.data) as EventData;
		// 	if (data.type === "connection") {
		// 		setIsConnected(true);
		// 	} else {
		// 		console.log("Received data", data.data);
		// 		setTrainData(data.data);
		// 	}
		// };
		// ws.onerror = (error) => {
		// 	console.error("WebSocket error:", error);
		// };
		// ws.onclose = () => {
		// 	setIsConnected(false);
		// 	console.log(
		// 		"WebSocket connection closed, attempting to reconnect..."
		// 	);
		// 	setTimeout(() => {
		// 		setReconnectDelay((prev) => Math.min(prev * 2, 30000)); // Exponential backoff, max 30 seconds
		// 		connectWebSocket(); // Attempt to reconnect
		// 	}, reconnectDelay);
		// };
	};

	useEffect(() => {
		connectWebSocket(); // Initial connection

		return () => {
			// webSocket.current?.close(); // Clean up on unmount
		};
	}, []);

	return (
		<TrainWebsocketContext.Provider value={{ trainData, isConnected }}>
			{children}
		</TrainWebsocketContext.Provider>
	);
};

export const useTrainWebsocket = () => {
	return useContext(TrainWebsocketContext);
};

import { DurableObject } from "cloudflare:workers";
import { Env } from "hono/types";

export class TrainData extends DurableObject {
	connections: Set<WebSocket>;

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.connections = new Set<WebSocket>();
	}

	async addConnection(ws: WebSocket) {
		console.log("Adding connection");
		this.connections.add(ws);
	}

	async removeConnection(ws: WebSocket) {
		console.log("Removing connection");
		this.connections.delete(ws);
	}

	async broadcast(data: string) {
		console.log(
			"Broadcasting data to",
			this.connections.size,
			"connections"
		);
		console.log("Data", data);
		this.connections.forEach((ws) => {
			ws.send(data);
		});
	}

	async fetch(request: Request) {
		const websocketPair = new WebSocketPair();
		const [client, server] = Object.values(websocketPair);

		console.log(
			"Received a new websocket connect request, adding to connections."
		);

		this.connections.add(client);
		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	webSocketError(ws: WebSocket, error: unknown) {
		console.error("webSocketError", error);
		this.connections.delete(ws);
	}

	webSocketClose(
		ws: WebSocket,
		_code: number,
		_reason: string,
		_wasClean: boolean
	) {
		console.log(
			"Closing a websocket connection, removing from connections."
		);
		this.connections.delete(ws);
	}
}

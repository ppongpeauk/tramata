import { DurableObject } from "cloudflare:workers";
import { Env } from "hono/types";

type Connection = {
	lat: number;
	lon: number;
};

type IdentifiableWebSocket = WebSocket & {
	id: string;
};

export class TrainData extends DurableObject {
	/**
	 * Map of websocket connections to latitudes and longitudes for train predictions
	 */
	connections: Record<IdentifiableWebSocket["id"], Connection> = {};

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);

		this.ctx.blockConcurrencyWhile(async () => {
			this.connections =
				(await this.ctx.storage.get("connections")) ?? {};
		});
	}

	async createIdentifiableWebSocket(
		ws: WebSocket & { id?: string }
	): Promise<IdentifiableWebSocket> {
		const id = crypto.randomUUID();
		ws.id = id;
		return ws as IdentifiableWebSocket;
	}

	async addConnection(ws: IdentifiableWebSocket, connection: Connection) {
		this.connections[ws.id] = connection;
		await this.ctx.storage.put("connections", this.connections);
	}

	async removeConnection(ws: IdentifiableWebSocket) {
		delete this.connections[ws.id];
		await this.ctx.storage.put("connections", this.connections);
	}

	async broadcast(type: string, data: any) {
		const connections = await this.ctx.getWebSockets();
		console.log("Broadcasting data to", connections.length, "connections");
		connections.forEach((ws) => {
			ws.send(JSON.stringify({ type, data }));
		});
	}

	async fetch(request: Request) {
		const websocketPair = new WebSocketPair();
		const [client, server] = Object.values(websocketPair);

		console.log("Received a new websocket connect request.");

		this.ctx.acceptWebSocket(server);

		const identifiableClient = await this.createIdentifiableWebSocket(
			client
		);
		this.addConnection(identifiableClient, { lat: 0, lon: 0 });

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	webSocketError(ws: WebSocket, error: unknown) {
		console.error("WebSocket error: ", error);
		ws.close();
	}

	webSocketClose(
		ws: WebSocket,
		_code: number,
		_reason: string,
		_wasClean: boolean
	) {
		console.log("WebSocket closed.");
		ws.close();
	}
}

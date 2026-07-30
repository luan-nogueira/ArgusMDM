import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:8080/ws";

let client: Client | null = null;

export function getStompClient(): Client {
  if (client) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
  client.activate();

  return client;
}

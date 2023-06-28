import Koa from "koa";
import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";

import { CustomWebSocket } from "./shared";

interface RoomClient {
  token: string;
  socket: CustomWebSocket;
}

interface RoomData {
  clients: RoomClient[];
  clientCount: number;
}

declare global {
  var clients: Map<string, CustomWebSocket>;
  var rooms: Map<string, RoomData>;
}

global.rooms = new Map<string, any>();
global.clients = new Map<string, CustomWebSocket>();

export class CustomWebSocketServer {
  private app: Koa;
  private httpServer: Server;
  private isRunning: boolean;
  private wss: null | WebSocketServer;

  constructor(app: Koa, httpServer: Server) {
    this.app = app;
    this.httpServer = httpServer;
    this.isRunning = false;
    this.wss = null;
  }

  start() {
    if (this.isRunning) return;

    if (!this.wss) {
      const wssOpt = {
        server: this.httpServer,
        path: "/chat",
      };

      const wss = new WebSocketServer(wssOpt);
      this.wss = wss;
    }

    this.wss?.on("connection", (ws, req) => this.handleConnect(this, ws, req));
  }

  handleConnect(
    server: CustomWebSocketServer,
    ws: WebSocket,
    req: IncomingMessage
  ) {
    new CustomWebSocket(this.app, ws, server);
    this.isRunning = true;
  }

  broadcastToRoom(roomId: string, packetId: string, data: object) {
    const room = global.rooms.get(roomId);
    if (room) {
      room.clients.forEach((client) => {
        if (client.socket.ws.readyState === WebSocket.OPEN) {
          client.socket.sendPacket(packetId, data);
        }
      });
    }
  }

  broadcast(packetId: string, data: any) {
    clients.forEach((client, jwt) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.sendPacket(packetId, data);
      }
    });
  }
}

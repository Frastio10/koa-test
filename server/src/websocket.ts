import Koa from "koa";
import WebSocket, { WebSocketServer } from "ws";

import { Server } from "http";
import path from "path";

import { getFiles, safeParseJSON, constructWsReply } from "./utils";

interface RoomClient {
  token: string;
  socket: EnhancedWebsocket;
}

interface RoomData {
  clients: RoomClient[];
  clientCount: number;
}

declare global {
  var clients: Map<string, EnhancedWebsocket>;
  var rooms: Map<string, RoomData>;
}

export interface EnhancedWebsocket extends WebSocket {
  packetInvalid(message?: string): void;
  unauthorized(message?: string): void;
  forbidden(message?: string): void;
  serverError(message?: string): void;

  sendPacket(packetId: string, data: any): void;
  broadcastToRoom(roomId: string, packetId: string, data: object): void;
  broadcast(packetId: string, data: object): void;
}

const rooms = new Map<string, any>();
const clients = new Map<string, EnhancedWebsocket>();

global.rooms = rooms;
global.clients = clients;

export class WsChatServer {
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

  handleMessages(ws: EnhancedWebsocket, buffer: Buffer) {
    try {
      const data = safeParseJSON(buffer.toString(), null);
      if (!data || !data.PacketID || !data.Data) return ws.packetInvalid();

      console.log(`[${data.PacketID}] requested`);

      const webSocketEventPath = path.resolve(__dirname, "./websocket-events");

      const eventFiles = getFiles(webSocketEventPath);

      const eventIds = eventFiles.map((v) => {
        const split = v.split("/").map((k) => k.replace(".js", ""));
        return split.pop() || split.pop();
      });

      if (!eventIds.includes(data.PacketID)) return ws.packetInvalid();

      for (const event of eventFiles) {
        const eventFile = require(event);

        if (eventFile.packetId === data.PacketID) {
          const client = global.clients.get(data.Data.Token);
          if (eventFile.isAuthOnly && !client) return ws.forbidden();

          return eventFile.callback(this.app, ws, data.Data);
        }
      }
    } catch (err) {
      console.log(err);
      return ws.packetInvalid();
    }
  }

  start() {
    if (this.isRunning) return;

    const parent = this;

    if (!parent.wss) {
      const wssOpt = {
        server: this.httpServer,
        path: "/chat",
      };

      const wss = new WebSocketServer(wssOpt);
      parent.wss = wss;
    }

    if (parent.wss) {
      parent.wss.on("connection", (ws: EnhancedWebsocket, req) => {
        parent.extendWebsocket(ws);
        parent.isRunning = true;

        ws.sendPacket("HANDSHAKE_SERVER", {});

        ws.on("error", console.error);
        ws.on("message", (buffer: Buffer) => parent.handleMessages(ws, buffer));
      });
    }
  }

  extendWebsocket(ws: EnhancedWebsocket) {
    ws.packetInvalid = function (message?: string) {
      this.sendPacket("ERR", {
        Code: "400",
        Message: message || "Packet is invalid",
      });
    };

    ws.unauthorized = function (message?: string) {
      this.sendPacket("ERR", {
        Code: "401",
        Message: message || "Unauthorized",
      });
    };

    ws.forbidden = function (message?: string) {
      this.sendPacket("ERR", {
        Code: "403",
        Message: message || "Forbidden",
      });
    };

    ws.serverError = function (message?: string) {
      this.sendPacket("ERR", {
        Code: "500",
        Message: message || "Internal server error.",
      });
    };

    ws.sendPacket = function (packetId: string, data: any) {
      const replyPacket = constructWsReply(packetId, data);
      this.send(replyPacket);
    };

    ws.broadcastToRoom = function (
      roomId: string,
      packetId: string,
      data: object
    ) {
      const room = global.rooms.get(roomId);
      if (room) {
        room.clients.forEach((client) => {
          if (client.socket.readyState === WebSocket.OPEN) {
            client.socket.sendPacket(packetId, data);
          }
        });
      }
    };

    ws.broadcast = function (packetId: string, data: any) {
      clients.forEach((client, jwt) => {
        if (client.readyState === WebSocket.OPEN) {
          client.sendPacket(packetId, data);
        }
      });
    };
  }
}

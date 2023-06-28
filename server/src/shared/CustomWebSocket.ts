import path from "path";
import Koa from "koa";
import WebSocket from "ws";
import { constructWsReply, getFiles, safeParseJSON } from "../utils";
import { CustomWebSocketServer } from "../websocket";
import BasePacket from "./BasePacket";

export default class CustomWebSocket {
  public ws: WebSocket;
  private app: Koa;
  private server: CustomWebSocketServer;

  constructor(app: Koa, ws: WebSocket, server: CustomWebSocketServer) {
    this.app = app;
    this.ws = ws;
    this.server = server;

    this.setup();
  }

  setup() {
    this.sendPacket("HANDSHAKE_SERVER", {});
    this.ws.on("error", console.error);
    this.ws.on("message", (buffer: Buffer) => this.handleMessages(buffer));
  }

  async handleMessages(buffer: Buffer) {
    try {
      const data = safeParseJSON(buffer.toString(), null);
      if (!data || !data.PacketID || !data.Data) return this.packetInvalid();

      console.log(`[${data.PacketID}] requested`);

      const webSocketEventPath = path.resolve(__dirname, "../websocket-events");

      const eventFiles = getFiles(webSocketEventPath);

      for (let i = 0; i < eventFiles.length; i++) {
        const Event = require(eventFiles[i]);

        const ev = new Event() as BasePacket;
        ev.server = this.server;

        if (ev.packetId === data.PacketID) {
          const client = global.clients.get(data.Data.Token);
          if (ev.isAuthOnly && !client) return this.forbidden();

          return ev.callback(this.app, this, data.Data);
        }

        if (i === eventFiles.length - 1 && ev.packetId !== data.PacketID) {
          return this.packetInvalid();
        }
      }
    } catch (err) {
      console.log(err);
      return this.packetInvalid();
    }
  }

  sendPacket(packetId: string, data: any) {
    const replyPacket = constructWsReply(packetId, data);
    this.ws.send(replyPacket);
  }

  packetInvalid(message?: string) {
    this.sendPacket("ERR", {
      Code: "400",
      Message: message || "Packet is invalid",
    });
  }

  unauthorized(message?: string) {
    this.sendPacket("ERR", {
      Code: "401",
      Message: message || "Unauthorized",
    });
  }

  forbidden(message?: string) {
    this.sendPacket("ERR", {
      Code: "403",
      Message: message || "Forbidden",
    });
  }

  serverError(message?: string) {
    this.sendPacket("ERR", {
      Code: "500",
      Message: message || "Internal server error.",
    });
  }
}

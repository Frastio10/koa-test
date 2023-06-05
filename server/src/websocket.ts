import WebSocket, { WebSocketServer } from "ws";
import Koa from "koa";
import { Server } from "http";
import { Error } from "sequelize";
import { constructReply } from "./utils";

const rooms = new Map();
const clients = new Set<WebSocket>();

export default function initWebsocket(app: Koa, httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/chat" });

  function broadcastToRoom(roomId: string, message: Buffer) {
    const room = rooms.get(roomId);
    if (room) {
      room.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  function broadcastToEveryone(message: Buffer) {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function constructWsReply(data: any): Buffer {
    try {
      const strObj = JSON.stringify(data);
      const buffer = Buffer.from(strObj);
      return buffer;
    } catch (err) {
      throw err;
    }
  }

  const chatActions = {
    join: (ws: WebSocket, roomId: string) => {},
    createRoom: () => {},
    message: () => {},
  };

  wss.on("connection", function connection(ws, req) {
    clients.add(ws);
    ws.on("error", console.error);
    ws.on("message", function message(buffer) {
      try {
        const data = JSON.parse(buffer.toString());
        const { packetId, roomId, msg, user } = data;
        if (!Object.keys(packetId).includes(packetId)) {
          ws.send(
            constructWsReply({
              packetId: "ERR",
              msg: "Packet ID is invalid",
            })
          );
        }

        console.log(data, buffer);
      } catch (err) {
        throw err;
      }
    });
  });
}

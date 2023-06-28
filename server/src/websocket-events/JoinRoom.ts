import Koa from "koa";
import { verifyJwt } from "../utils";
import BasePacket from "../shared/BasePacket";
import { CustomWebSocket } from "../shared";

export = class JoinRoom extends BasePacket {
  constructor() {
    super({
      packetId: "JOIN_ROOM",
      isAuthOnly: false,
    });
  }

  callback(koa: Koa, ws: CustomWebSocket, data: any) {
    try {
      const room = global.rooms.get(data.RoomID);
      const clientData = verifyJwt(data.Token) as any;
      if (!clientData) return ws.unauthorized();

      if (!room) {
        return ws.sendPacket("ERR_ROOM_DOES_NOT_EXIST", {
          Message: "Room doesn't exist",
        });
      }

      const clients = room.clients;
      for (const client of clients) {
        if (client.token === data.Token) {
          return ws.sendPacket("ERR_CLIENT_ALREADY_JOINED", {
            Message: "Client already in the room",
          });
        }
      }

      room.clients.push({
        token: data.Token,
        socket: ws,
      });

      room.clientCount = room.clients.length;
      console.log(this.server);

      return this.server?.broadcastToRoom(data.RoomID, "USER_JOINED", {
        Message: "A user joined the room",
        RoomID: data.RoomID,
        ClientCount: room.clients.length,
        NewClientData: {
          Email: clientData.user.email,
          IsVerified: clientData.user.IsVerified,
          Token: data.Token,
        },
      });
    } catch (err) {
      console.log(err);
      return ws.serverError();
    }
  }
};

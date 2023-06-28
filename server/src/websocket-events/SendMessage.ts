import Koa from "koa";
import { CustomWebSocket } from "../shared";
import BasePacket from "../shared/BasePacket";
import { verifyJwt } from "../utils";

export = class SendMessage extends BasePacket {
  constructor() {
    super({
      packetId: "SEND_MESSAGE",
      isAuthOnly: true,
    });
  }

  callback(koa: Koa, ws: CustomWebSocket, data: any) {
    try {
      const room = global.rooms.get(data.RoomID);

      const isInRoom = room?.clients.some((v) => v.token === data.Token);
      if (!isInRoom) return ws.forbidden("You don't have access to this room");

      const user = verifyJwt(data.Token);
      console.log(user);

      this.server?.broadcastToRoom(data.RoomID, "INCOMING_MESSAGE", {
        Message: data.Message,
        RoomID: data.RoomID,
        Sender: data.Token,
      });
    } catch (err) {
      console.log(err);
      ws.serverError();
    }
  }
};

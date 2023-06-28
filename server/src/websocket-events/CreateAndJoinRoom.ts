import Koa from "koa";
import { createRandomString, verifyJwt } from "../utils";
import BasePacket from "../shared/BasePacket";
import { CustomWebSocket } from "../shared";
import Room from "../modules/chat/models/room.model";

export = class CreateAndJoinRoom extends BasePacket {
  constructor() {
    super({
      packetId: "CREATE_AND_JOIN_ROOM",
      isAuthOnly: true,
    });
  }

  async callback(koa: Koa, ws: CustomWebSocket, data: any) {
    try {
      let roomId = createRandomString();
      if (global.rooms.get(roomId)) roomId = createRandomString();

      global.rooms.set(roomId, {
        clients: [{ token: data.Token, socket: ws }],
        clientCount: 1,
      });

      const { user } = verifyJwt(data.Token) as any;

      const roomDb = await Room.create({
        uniqueCode: roomId,
        name: "kamar_" + roomId,
        ownerId: user.id,
        memberIds: [user.id],
      });

      ws.sendPacket("ROOM_CREATED", {
        RoomID: roomId,
        ClientCount: 1,
      });

      console.log(global.rooms);
    } catch (err) {
      console.log(err);
      return ws.unauthorized();
    }
  }
};

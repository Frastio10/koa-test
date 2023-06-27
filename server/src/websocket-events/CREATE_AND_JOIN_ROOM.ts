import Koa from "koa";
import { EnhancedWebsocket } from "../websocket";
import { createRandomString, verifyJwt } from "../utils";

export = {
  packetId: "CREATE_AND_JOIN_ROOM",
  isAuthOnly: true,
  callback: (koa: Koa, ws: EnhancedWebsocket, data: any) => {
    try {
      let roomId = createRandomString();
      if (global.rooms.get(roomId)) roomId = createRandomString();

      global.rooms.set(roomId, {
        clients: [{ token: data.Token, socket: ws }],
        clientCount: 1,
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
  },
};

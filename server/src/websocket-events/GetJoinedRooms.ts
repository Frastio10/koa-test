import Koa from "koa";
import { createRandomString, verifyJwt } from "../utils";
import BasePacket from "../shared/BasePacket";
import { CustomWebSocket } from "../shared";
import Room from "../modules/chat/models/room.model";
import sequelize from "sequelize";

export = class CreateAndJoinRoom extends BasePacket {
  constructor() {
    super({
      packetId: "GET_JOINED_ROOMS",
      isAuthOnly: true,
    });
  }

  async callback(koa: Koa, ws: CustomWebSocket, data: any) {
    try {
      const { user } = verifyJwt(data.Token) as any;

      const joinedRooms = await Room.findAll({
        where: {
          memberIds: {
            [sequelize.Op.contains]: [user.id],
          },
        },
        attributes: ["id", "uniqueCode", "name"],
      });

      console.log("Joined Rooms:", joinedRooms);
    } catch (err) {
      console.log(err);
      return ws.unauthorized();
    }
  }
};

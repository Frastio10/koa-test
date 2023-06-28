import Koa from "koa";
import { verifyJwt } from "../utils";
import BasePacket from "../shared/BasePacket";
import { CustomWebSocket } from "../shared";

export = class CheckUser extends BasePacket {
  constructor() {
    super({
      packetId: "CHK_USER",
      isAuthOnly: false,
    });
  }

  callback(koa: Koa, ws: CustomWebSocket, data: any) {
    try {
      const clientData = global.clients.get(data.Token);
      if (clientData) {
        return ws.sendPacket("ERR_ALREADY_LOGGED_IN", {
          Message: "You are already logged in",
        });
      }

      const user = verifyJwt(data.Token) as any;
      if (!user) return ws.unauthorized();

      ws.sendPacket("JOIN_SUCCESS", {
        email: user.user.email,
        isVerified: user.user.isVerified,
      });

      global.clients.set(data.Token, ws);
    } catch (err) {
      console.log(err);
      return ws.unauthorized();
    }
  }
}

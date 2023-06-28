import Koa from "koa";
import { CustomWebSocketServer } from "../websocket";
import CustomWebSocket from "./CustomWebSocket";

type PacketConfig = {
  packetId: string;
  isAuthOnly: boolean;
};

class BasePacket {
  public packetId: string;
  public isAuthOnly: boolean;
  public server: CustomWebSocketServer | null;

  constructor({ packetId, isAuthOnly }: PacketConfig) {
    this.packetId = packetId;
    this.isAuthOnly = isAuthOnly;
    this.server = null;
  }

  callback(koa: Koa, ws: CustomWebSocket, data: any) {}

  log(...args: any) {
    console.log(...args);
  }
}

export default BasePacket;

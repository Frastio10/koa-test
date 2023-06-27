import jwt from "jsonwebtoken";
import { Dirent, readdirSync } from "fs";
import { Context } from "koa";

export function constructReply(ctx: Context, code: number, data: any) {
  ctx.body = data;
  ctx.status = code;

  return;
}

export function constructWsReply(packetId: string, data: any): Buffer {
  try {
    const obj = { PacketID: packetId, Data: { ...data } };
    const strObj = JSON.stringify(obj);
    const buffer = Buffer.from(strObj);
    return buffer;
  } catch (err) {
    throw err;
  }
}

export function verifyJwt(token: string) {
  try {
    const decode = jwt.verify(token, process.env.APP_SECRET as string);
    return decode;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function serialize(data: any) {
  const newData = data;

  const notAllowedProperties = [
    "password",
    "verificationCode",
    "verificationCodeExpiresAt",
  ];

  for (let i = 0; i < notAllowedProperties.length; i++) {
    const property = notAllowedProperties[i];
    delete newData.dataValues[property];
  }

  return newData;
}

export const safeParseJSON = (inputString: string, fallback: any) => {
  if (inputString) {
    try {
      return JSON.parse(inputString);
    } catch (e) {
      return fallback;
    }
  }
};

export function createRandomString(len = 8) {
  return Math.random()
    .toString(36)
    .substring(2, len + 2);
}

export const getFiles = (dir: string, suffix: string = ".js"): string[] => {
  const files: Dirent[] = readdirSync(dir, {
    withFileTypes: true,
  });

  let filesFound: string[] = [];

  for (const file of files) {
    if (file.isDirectory()) {
      filesFound = [...filesFound, ...getFiles(`${dir}/${file.name}`, suffix)];
    } else if (file.name.endsWith(suffix)) {
      filesFound.push(`${dir}/${file.name}`);
    }
  }

  return filesFound;
};

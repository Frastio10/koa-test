import { Context } from "koa";

export function constructReply(ctx: Context, code: number, data: any) {
  ctx.body = data;
  ctx.status = code;

  return;
}

export function serialize(ctx: Context, data: any) {
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

export function createRandomString(len = 8) {
  return Math.random()
    .toString(36)
    .substring(2, len + 2);
}

import { Context, Next } from "koa";

export async function validateHelloRequest(ctx: Context, next: Next) {
  const data = ctx.request.body as any;
  // if (
  //   !data.email ||
  //   !data.password ||
  //   data.email.length < 3 ||
  //   data.password.length < 3
  // )
  //   ctx.throw(403, { message: "Bad request!" });
  await next();
}

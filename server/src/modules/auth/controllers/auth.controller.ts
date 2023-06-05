import { Context } from "koa";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../user/models/user.model";
import { constructReply, createRandomString } from "../../../utils";
import { sendMail } from "../../../config/mailer";
import { getUser, getUsers } from "../../user/services/user.services";

const VERIFY_CODE_TIME = 60;
class AuthController {
  async login(ctx: Context) {
    try {
      if (ctx.state.user) {
        return constructReply(ctx, 400, {
          message: "You already logged in",
          data: ctx.state.user,
        });
      }

      const { email, password } = ctx.request.body as any;

      const user = await User.findOne({ where: { email } });
      if (!user) return constructReply(ctx, 400, { message: "No user found" });
      if (!user.dataValues.isVerified) {
        return constructReply(ctx, 401, {
          message: "Please verify your account first.",
        });
      }

      const checkPassword = await bcrypt.compare(
        password,
        user.dataValues.password
      );

      if (!checkPassword) {
        return constructReply(ctx, 403, { message: "Incorrect password" });
      }

      const token = jwt.sign({ user }, process.env.APP_SECRET as string);

      return constructReply(ctx, 201, { message: "success", data: token });
    } catch (err) {
      console.log(err);
    }
  }

  async register(ctx: Context) {
    try {
      const { email, password } = ctx.request.body as any;
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        ctx.body = {
          message: "Email already exists!",
        };
        ctx.status = 400;

        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const verificationCode = createRandomString();
      const verificationCodeExpiresAt = new Date();
      verificationCodeExpiresAt.setSeconds(
        verificationCodeExpiresAt.getSeconds() + VERIFY_CODE_TIME
      );

      const newUser = await User.create({
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpiresAt,
      });

      await sendMail(
        email,
        "Email Verification Code",
        `Your verification code is ${verificationCode}`
      );

      ctx.body = {
        message: "Success",
        data: newUser,
      };
      ctx.status = 201;

      return;
    } catch (err) {
      ctx.status = 500;
      throw err;
    }
  }

  async resendVerification(ctx: Context) {
    try {
      const { email } = ctx.request.body as any;
      if (!email) return constructReply(ctx, 400, "Email is invalid");

      const user = await getUser({ where: { email } });
      if (!user) return constructReply(ctx, 401, "User not found.");

      const userTime = user.dataValues.verificationCodeExpiresAt.getTime();

      if (userTime > new Date().getTime()) {
        const remainingTime = Math.ceil(
          (userTime - new Date().getTime()) / 1000
        ); // x seconds

        return constructReply(ctx, 401, {
          message: `Please wait ${remainingTime} seconds to resend the verificationCode`,
        });
      }

      const verificationCode = createRandomString();
      const verificationCodeExpiresAt = new Date();
      verificationCodeExpiresAt.setSeconds(
        verificationCodeExpiresAt.getSeconds() + VERIFY_CODE_TIME
      );

      const newUser = await User.update(
        { verificationCode, verificationCodeExpiresAt },
        { where: { email } }
      );

      console.log(newUser);

      await sendMail(
        email,
        "Email Verification Code",
        `Your new verification code is ${verificationCode}`
      );

      return constructReply(ctx, 200, { message: "Succes" });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async verify(ctx: Context) {
    try {
      const { email, code } = ctx.request.body as any;
      if (!email) return constructReply(ctx, 400, "Email is invalid");
      if (!code) {
        return constructReply(ctx, 400, "Verification Code is invalid");
      }

      const user = await getUser({ where: { email } });
      if (!user) return constructReply(ctx, 400, "User not found");
      if (user.dataValues.isVerified) {
        return constructReply(ctx, 403, "User is verified");
      }

      if (code !== user.dataValues.verificationCode) {
        return constructReply(ctx, 403, "Verification code is incorrect!");
      }

      if (user.dataValues.verificationCodeExpiresAt < new Date()) {
        return constructReply(ctx, 400, {
          message: "Verification Code is expired",
        });
      }

      await User.update(
        { isVerified: true, verificationCode: null },
        { where: { email, verificationCode: code } }
      );

      return constructReply(ctx, 200, {
        message: "Success, please login to your account",
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new AuthController();

import { Context } from "koa";
import { constructReply, serialize } from "../../../utils";
import { getUserById } from "../services/user.services";

class UserController {
  async me(ctx: Context) {
    const currentUser = ctx.state.user;
    if (!currentUser) {
      return constructReply(ctx, 403, { message: "You need to login" });
    }

    const userData = await getUserById(currentUser.user.id);

    return constructReply(ctx, 200, { data: serialize(userData) });
  }
}

export default new UserController();

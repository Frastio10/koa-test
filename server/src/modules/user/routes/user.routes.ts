import Router from "koa-router";
import userController from "../controllers/user.controller";
import { validateHelloRequest } from "../middlewares/user.middlewares";

const router = new Router();

router.get("/me", validateHelloRequest, userController.me);

export default router;

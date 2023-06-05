import Router from "koa-router";
import authController from "../controllers/auth.controller";
import { validateHelloRequest } from "../middlewares/auth.middlewares";

const router = new Router();

router.post("/local", validateHelloRequest, authController.login);
router.post("/register", validateHelloRequest, authController.register);
router.post("/verify", validateHelloRequest, authController.verify);
router.post("/resend", validateHelloRequest, authController.resendVerification);

export default router;

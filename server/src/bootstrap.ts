import fs from "fs";
import path from "path";
import Koa from "koa";
import Router from "koa-router";
import jobs from "./config/cron";

import "./config/db";
import CronService from "./cron";
import { CustomWebSocketServer } from "./websocket";
import { Server } from "http";

const getHTTPModules = (app: Koa) => {
  const modulesDir = path.join(__dirname, "modules");
  fs.readdirSync(modulesDir).forEach((moduleName) => {
    const modulePath = path.join(modulesDir, moduleName);
    const routerPath = path.join(
      modulePath,
      "routes",
      `${moduleName}.routes.js`
    );

    if (fs.existsSync(routerPath)) {
      const moduleRouter = require(routerPath).default;
      const router = new Router();

      router.use(`/${moduleName}`, moduleRouter.routes());

      app.use(router.routes());
      app.use(router.allowedMethods());
    }
  });
};

export default function (app: Koa, httpServer: Server) {
  getHTTPModules(app);

  const cron = new CronService();
  cron.add(jobs);
  cron.start();

  const chatServer = new CustomWebSocketServer(app, httpServer);
  chatServer.start();
}

import fs from "fs";
import path from "path";
import Koa from "koa";
import Router from "koa-router"

import './config/db'

export default function (app: Koa) {

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
      const router = new Router()

      router.use(`/${moduleName}`, moduleRouter.routes())
      
      app.use(router.routes());
      app.use(router.allowedMethods());
    }

    // const moduleWebsocketPath = path.join(modulePath, 'websocket.js')
    // if(fs.existsSync(moduleWebsocketPath)){
    //   const moduleWebsocket = require(moduleWebsocketPath).default
    //   moduleWebsocket(app)
    // }
  });
}

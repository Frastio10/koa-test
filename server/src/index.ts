import Koa from "koa";
import http from "node:http";
import logger from "koa-logger";
import json from "koa-json";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import jwt from "koa-jwt";

import "dotenv/config";

import bootstrap from "./bootstrap";

const PORT = process.env.PORT as string;

const app = new Koa();
const httpServer = http.createServer(app.callback());

app.use(bodyParser());
app.use(cors());
app.use(json());
app.use(logger());

app.use(jwt({ secret: process.env.APP_SECRET as string, passthrough: true }));

bootstrap(app, httpServer);

httpServer.listen(PORT, () => console.log("Koa started on port: " + PORT));

import { config } from "dotenv";
import { app as electronApp } from "electron";
import pino from "pino";
import { Application } from "./application";
import { Win } from "./win";

// configure dotenv
config();
const env = process.env as {[key: string]: string};

// keep the app in global memory, to prevent gc
let app: Application;

electronApp.on("ready", () => {
  const logger = pino();
  app = new Application({
    captureWindowTitle: env.SERVICE_URL,
    expHideStreamer: env.EXP_HIDE_STREAMER === "true",
    height: Number.parseInt(env.HEIGHT, 10).valueOf(),
    logger,
    signalConfig: {
      pollIntervalMs: Number.parseInt(env.POLL_INTERVAL, 10).valueOf(),
      url: env.POLL_URL,
    },
    streamerConfig: {
      iceServers: [
        {
          credential: env.TURN_PASSWORD,
          credentialType: "password",
          urls: [env.TURN_URL],
          username: env.TURN_USERNAME,
        },
      ],
    },
    url: env.SERVICE_URL,
    width: Number.parseInt(env.WIDTH, 10).valueOf(),
    winProvider: new Win(),
  });

  app.boot().then(() => {
    logger.info("Node: booted");
  }, (err) => {
    logger.error(`Node: boot failed: ${err}`);
  });
});

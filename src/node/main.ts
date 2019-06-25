import { app as electronApp } from "electron";
import pino from "pino";
import { Application } from "./application";
import { Win } from "./win";

// keep the app in global memory, to prevent gc
let app: Application;

electronApp.on("ready", () => {
  const logger = pino();
  app = new Application({
    captureWindowTitle: "Google",
    expHideStreamer: false,
    logger,
    signalConfig: {
      pollIntervalMs: 5000,
      url: "https://sig.con",
    },
    streamerConfig: {
      iceServers: [
        { urls: "turn:turn:3789" },
      ],
    },
    url: "https://google.com",
    winProvider: new Win(),
  });
});

import { app as electronApp } from "electron";
import pino from "pino";
import { Application } from "./application";

electronApp.on("ready", () => {
  const logger = pino();
  const app = new Application({
    captureWindowTitle: "Google",
    logger,
    url: "https://google.com",
  });
});

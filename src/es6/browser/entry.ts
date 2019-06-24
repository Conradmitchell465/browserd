import { desktopCapturer, remote } from "electron";
import pino from "pino";
import { K_PRELOAD_INIT_FLAG, K_PRELOAD_INIT_KEY, K_PRELOAD_WIN_KEY } from "../base/constants";
import { Application } from "./application";
import { Peer } from "./peer";
import { Signal } from "./signal";
import { UserMedia } from "./usermedia";

let captureWindowTitle: string;
const logger = pino();

// blockscope as to not leak preload-init flag to the wider scope
{
  const preloadInit = remote.getGlobal(K_PRELOAD_INIT_FLAG);
  if (preloadInit[K_PRELOAD_INIT_KEY]) {
    logger.info("Cannot re-preload, unsupported operation");
    process.exit(-1);
  } else {
    preloadInit[K_PRELOAD_INIT_KEY] = true;
  }

  captureWindowTitle = preloadInit[K_PRELOAD_WIN_KEY];
}

const captureWindow = remote.BrowserWindow
  .getAllWindows()
  .find((w) => w.getTitle() === captureWindowTitle);
const app = new Application({
  captureWindowTitle,
  iceServers: [
    { urls: "turn:turn:turn" },
  ],
  logger,
  signalProvider: new Signal({
    pollIntervalMs: 5000,
    url: "https://google.com/signal-poll",
  }),
  streamProvider: new UserMedia({
    getSources: desktopCapturer.getSources,
    getUserMedia: navigator.mediaDevices.getUserMedia,
  }),
  webrtcProvider: new Peer(),
});

app.on("input", (evt) => {
  if (captureWindow) {
    captureWindow.webContents.sendInputEvent(evt);
  }
});

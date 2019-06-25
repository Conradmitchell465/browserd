import * as path from "path";
import { Logger } from "pino";
import {
  K_BROWSER_CONFIG,
  K_BROWSER_STORAGE,
  K_CAPTURE_WIN,
  K_SIGNAL_CONFIG,
} from "../base/constants";
import { IWindowProvider } from "../base/window-provider";
import { ISignalOpts } from "../browser/signal";

/**
 * Application constructor options
 */
interface IApplicationOpts {
  /**
   * A logger
   */
  logger: Logger;

  /**
   * The url to stream (visually)
   */
  url: string;

  /**
   * The capture window name
   */
  captureWindowTitle: string;

  /**
   * Signal configuration
   */
  signalConfig: ISignalOpts;

  /**
   * Streamer (browser/application) configuration
   */
  streamerConfig: { iceServers: RTCIceServer[] };

  /**
   * Experiment: hide the streamer window
   */
  expHideStreamer: boolean;

  /**
   * A window provider
   */
  winProvider: IWindowProvider;
}

/**
 * Node application - orchestrates electron main process
 */
export class Application {
  /**
   * Default Ctor
   * @param opts ctor opts
   */
  constructor(opts: IApplicationOpts) {
    this.boot(opts).then(() => {
      opts.logger.info("Node: application booted");
    },
      (err) => {
        opts.logger.error(`Node: application failed: ${err}`);
      });
  }

  /**
   * Internal boot up helper
   * @param opts ctor opts
   */
  private async boot({
    logger,
    url,
    captureWindowTitle,
    signalConfig,
    streamerConfig,
    expHideStreamer,
    winProvider,
  }: IApplicationOpts) {
    logger.info("Node: creating browser");

    await winProvider.createWindow({
      alwaysOnTop: true,
      backgroundColor: "#000",
      title: captureWindowTitle,
      url,
    });

    logger.info("Node: created browser");

    // give our content window another second - to be sure x is happy
    await new Promise((resolve) => setTimeout(() => resolve(), 1000));

    // setup our globals so the streamer-process can access it's config
    this.setGlobals({
      captureWindowTitle,
      signalConfig,
      streamerConfig,
    });

    logger.info("Node: Creating streamer");

    const streamerWindow = await winProvider.createWindow({
      height: 10,
      url: "https://github.com/bengreenier/browserd",
      webPreferences: {
        // this is what triggers our actual streamer logic (webrtc init and whatnot)
        preload: path.join(__dirname, "/../browser/main.js"),
      },
      width: 10,
    });

    logger.info("Node: created streamer");

    // if we're running the hide_streamer flight, hide it
    if (expHideStreamer) {
      streamerWindow.hide();
      logger.info("Node: experiment - hiding streamer window");
    }
  }

  /**
   * Set globals
   * @param opts the global values
   */
  private setGlobals({
    captureWindowTitle,
    signalConfig,
    streamerConfig,
  }: Partial<IApplicationOpts>) {
    const glob: { [key: string]: any } = {};
    glob[K_CAPTURE_WIN] = captureWindowTitle;
    glob[K_BROWSER_CONFIG] = streamerConfig;
    glob[K_SIGNAL_CONFIG] = signalConfig;
    (global as any)[K_BROWSER_STORAGE] = glob;
  }
}

import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { Logger } from "pino";

interface IApplicationOpts {
  logger: Logger;
  url: string;
  captureWindowTitle: string;
}

export class Application {
  constructor(opts: IApplicationOpts) {
    this.boot(opts).then(() => {
      opts.logger.info("Application booted");
    }, (err) => {
      opts.logger.error(`Application failed: ${err}`);
    });
  }

  private async boot(opts: IApplicationOpts) {
    await this.createWindow(opts.url, {
      alwaysOnTop: true,
      backgroundColor: "#000",
      title: opts.captureWindowTitle,
    });

    // give our content window another second - to be sure x is happy
    await new Promise((resolve) => setTimeout(() => resolve(), 1000));

    const streamerWindow = await this.createWindow("chrome://webrtc-internals", {
        height: 10,
        webPreferences: {
            // this is what triggers our actual streamer logic (webrtc init and whatnot)
            preload: `${__dirname}/../browser/preload.js`,
        },
        width: 10,
        x: 100,
        y: 100,
    });

    // if we're running the hide_streamer flight, hide it
    if (process.env.EXP_HIDE_STREAMER === "true") {
        streamerWindow.hide();
        opts.logger.info("experiment: hiding streamer window");
    }
  }

  /**
   * Creates a browser view, and resolves when it is ready
   * @param url default shown url
   * @param opts browser view options
   */
  private createWindow(url: string, opts?: BrowserWindowConstructorOptions) {
   return new Promise<BrowserWindow>((resolve, reject) => {
     try {
       const bw = new BrowserWindow({
         ...opts,
         show: false,
       });

       bw.on("page-title-updated", (e) => {
         if (opts && opts.title) {
           e.preventDefault();
         }
       });

       bw.once("ready-to-show", () => {
         bw.show();
         resolve(bw);
       });

       bw.loadURL(url);
     } catch (err) {
       reject(err);
     }
   });
 }
}

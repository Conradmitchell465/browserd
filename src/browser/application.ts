import { Logger } from "pino";
import { v4 as uuid } from "uuid";
import { IInputHandler, IInputMessage } from "../base/input-handler";
import { ISignalProvider } from "../base/signal-provider";
import { IStreamProvider } from "../base/stream-provider";
import { IWebrtcProvider } from "../base/webrtc-provider";

/**
 * Application constructor options
 */
export interface IApplicationOpts {
  /**
   * A logger
   */
  logger: Logger;

  /**
   * The name of the capture window
   */
  captureWindowTitle: string;

  /**
   * The ice servers to use
   */
  iceServers: RTCIceServer[];

  /**
   * The signal provider to use
   */
  signalProvider: ISignalProvider;

  /**
   * The stream provider to use
   */
  streamProvider: IStreamProvider;

  /**
   * The webrtc provider to use
   */
  webrtcProvider: IWebrtcProvider;

  /**
   * The input handler to use
   */
  inputHandler: IInputHandler;
}

/**
 * A browser application - orchestrates the streamer experience
 */
export class Application {
  /**
   * Default ctor
   * @param opts ctor options
   */
  constructor(opts: IApplicationOpts) {
    opts.logger.info("Browser: initializing application");

    this.boot(opts).then(() => {
      opts.logger.info("Browser: initialized");
    }, (err: any) => {
      opts.logger.error(`Browser: initializing failed: ${err}`);
    });
  }

  /**
   * Internal boot helper
   */
  private async boot({
    logger,
    captureWindowTitle,
    iceServers,
    signalProvider,
    streamProvider,
    webrtcProvider,
    inputHandler,
  }: IApplicationOpts) {
    const devices = await streamProvider.enumerateDevices((e) => e.name === captureWindowTitle);
    const selectedDevice = devices[0];
    const stream = await streamProvider.createStream(selectedDevice);

    webrtcProvider.initialize(iceServers, stream);
    await signalProvider.signIn(`${captureWindowTitle}.${uuid()}`);

    let remotePeerId: string;
    signalProvider.on("error", (err) => {
      logger.error(`Browser: signal error: ${err}`);
    });
    signalProvider.on("peer-message", (data, id) => {
      remotePeerId = id;

      const parsed = JSON.parse(data);
      // rewrap
      if (parsed.candidate) {
          parsed.candidate = { candidate: parsed.candidate };
      }
      webrtcProvider.signal(parsed);
    });

    webrtcProvider.on("signal", async (data) => {
      // unwrap
      if (data.candidate) {
        data = data.candidate;
      }
      await signalProvider.send(JSON.stringify(data), remotePeerId);
    });
    webrtcProvider.on("data", (data) => {
      data = data.toString();
      inputHandler.processAndRaiseMessage(JSON.parse(data) as IInputMessage);
    });
  }
}

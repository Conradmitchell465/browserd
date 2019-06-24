import { EventEmitter } from "events";
import { Logger } from "pino";
import StrictEventEmitter from "strict-event-emitter-types";
import { v4 as uuid } from "uuid";
import { ISignalProvider } from "../base/signal-provider";
import { IStreamProvider } from "../base/stream-provider";
import { IWebrtcProvider } from "../base/webrtc-provider";

interface IBrowserInputEvent {
  type: string;
  version: number;
  data: any;
}

export interface IApplicationEvents {
  input: (evt: any) => void;
}

/**
 * The strongly-typed application emitter type that we'll extend for our app
 */
type ApplicationEmitter = StrictEventEmitter<EventEmitter, IApplicationEvents>;

export interface IApplicationOpts {
  logger: Logger;
  captureWindowTitle: string;
  iceServers: RTCIceServer[];
  signalProvider: ISignalProvider;
  streamProvider: IStreamProvider;
  webrtcProvider: IWebrtcProvider;
}

export class Application extends (EventEmitter as new() => ApplicationEmitter) {
  constructor(opts: IApplicationOpts) {
    super();

    opts.logger.info("Initializing application");

    this.boot(opts).then(() => {
      opts.logger.info("Initialized");
    }, (err: any) => {
      opts.logger.error(`Initializing failed: ${err}`);
    });
  }

  private async boot(opts: IApplicationOpts) {
    const devices = await opts.streamProvider.enumerateDevices((e) => e.name === opts.captureWindowTitle);
    const selectedDevice = devices[0];
    const stream = await opts.streamProvider.createStream(selectedDevice);

    opts.webrtcProvider.initialize(opts.iceServers, stream);
    await opts.signalProvider.signIn(`${opts.captureWindowTitle}.${uuid()}`);

    let remotePeerId: string;
    opts.signalProvider.on("error", (err) => {
      opts.logger.error(`Signal error: ${err}`);
    });
    opts.signalProvider.on("peer-message", (data, id) => {
      remotePeerId = id;

      const parsed = JSON.parse(data);
      // rewrap
      if (parsed.candidate) {
          parsed.candidate = { candidate: parsed.candidate };
      }
      opts.webrtcProvider.signal(parsed);
    });

    opts.webrtcProvider.on("signal", async (data) => {
      // unwrap
      if (data.candidate) {
        data = data.candidate;
      }
      await opts.signalProvider.send(JSON.stringify(data), remotePeerId);
    });
    opts.webrtcProvider.on("data", (data) => {
      data = data.toString();
      this.handleInput(JSON.parse(data) as IBrowserInputEvent);
    });
  }

  private handleInput(evt: IBrowserInputEvent) {
    // TODO(parse)
    this.emit("input", evt);
  }
}

import { DesktopCapturerSource, SourcesOptions } from "electron";
import { IDeviceInfo, IStreamProvider } from "../base/stream-provider";
import { BrowserMediaStream } from "./browser-media-stream";

export interface IUserMediaOpts {
  getSources: (opts: SourcesOptions, cb: (err: Error, sources: DesktopCapturerSource[]) => void) => void;
  getUserMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
}

export class UserMedia implements IStreamProvider {
  private opts: IUserMediaOpts;
  constructor(opts: IUserMediaOpts) {
    this.opts = opts;
  }

  public async enumerateDevices(filter?: (device: IDeviceInfo) => boolean) {
    const sources = await this.getSourcesAsync();
    return sources.map((source) => {
      const device: IDeviceInfo = {
        id: source.id,
        name: source.name,
      };

      return device;
    }).filter((e) => filter ? filter(e) : true);
  }

  public async createStream(device: IDeviceInfo) {
    const media = await this.opts.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "system",
          chromeMediaSourceId: device.id,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: device.id,
        },
      },
    } as any);

    return new BrowserMediaStream(media);
  }

  private getSourcesAsync() {
    return new Promise<DesktopCapturerSource[]>((resolve, reject) => {
      this.opts.getSources({
        types: [
          "screen",
          "window",
        ],
      }, (err, sources) => {
        if (err) {
          reject(err);
        } else {
          resolve(sources);
        }
      });
    });
  }
}

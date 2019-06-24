import { IStream } from "../base/stream-provider";

export class BrowserMediaStream implements IStream {
  private stream: MediaStream;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  public toMediaStream(): MediaStream {
    return this.stream;
  }
}

import { parse as parseSdp, write as writeSdp } from "sdp-transform";
import SimplePeer from "simple-peer";
import { IStream } from "../base/stream-provider";
import { IWebrtcProvider } from "../base/webrtc-provider";
/**
 * An array type for rtp data
 */
type rtpArray = Array<{ payload: number, codec: string, rate: number }>;

export class Peer extends IWebrtcProvider {
  private instance?: SimplePeer.Instance;

  public initialize(iceServers: RTCIceServer[], stream: IStream) {
    if (this.instance) {
      throw new Error("Already initialized");
    }

    this.instance = new SimplePeer({
      config: {
        iceServers,
      },
      initiator: false,
      sdpTransform: this.forceH264Sdp,
      stream: stream.toMediaStream(),
    });

    this.instance.on("error", (err) => this.emit("error", err));
    this.instance.on("connect", () => this.emit("connect"));
    this.instance.on("close", () => this.emit("disconnect"));
    this.instance.on("signal", (data) => this.emit("signal", data));
    this.instance.on("data", (data) => this.emit("data", data));
  }

  public signal(data: any) {
    if (this.instance) {
      this.instance.signal(data);
    }
  }

  public destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = undefined;
    }
  }

  private forceH264Sdp(sdp: any) {
    const obj = parseSdp(sdp);

    // find the video media lines
    obj.media = obj.media.map((media) => {
      // if it isn't video, pass through
      if (media.type !== "video") {
        return media;
      }
      // for each, iterate over the rtp array (note: typings is incorrect for chrome m73 - rtp is array)
      const rtpArr: rtpArray = media.rtp as any;

      // find all the h264 entries in the array
      const rtpH264 = rtpArr.filter((rtp) => rtp.codec === "H264");

      // assuming we found one...
      if (rtpH264.length > 0) {
        // take the first one's payload value (as a string)
        const h264 = rtpH264[0].payload.toString();

        if (!media.payloads) {
          throw new Error("missing payloads in sdp");
        }

        // take the media lines payload values, and remove the exact one
        // we found above - we're going to set it as the default
        const payloads = media.payloads
          .split(" ")
          .filter((payload) => payload !== h264);

        // make the exact one we found above re-added, as the first entry
        payloads.unshift(h264);

        // finally, save the payloads literal back to the media line
        media.payloads = payloads.join(" ");

        return media as any;
      }
    });

    // modify mLine to contain only h264 codec
    sdp = writeSdp(obj);

    return sdp;
  }
}

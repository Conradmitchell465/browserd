# browserd

Headless electron app platform for the cloud 🤕☁✨
This app is broken down into the stream-provider and the stream-consumer

We needed a way to run chrome-based [browser experiences](https://github.com/bengreenier/browserd/tree/repo-restructure/packages/stream-consumer) inside a container, and to stream that container to [remote clients](https://github.com/bengreenier/browserd/issues/2) using webrtc.
Browserd (named to indicate it's a browser [daemon](https://en.wikipedia.org/wiki/Daemon_(computing))) uses electron to do so.

## Components

### Stream-Consumer

[This simple web app](https://github.com/bengreenier/browserd/tree/repo-restructure/packages/stream-consumer) connects to the stream-provider through a signaling server. It recieves and displays a stream from the cloud, and it can send input to the cloud.

[![Build Status](Branch not built yet)
[![Quality Gate Status](Branch not built yet)

### Stream-Provider

[This application](https://github.com/bengreenier/browserd/tree/repo-restructure/packages/stream-provider) connects to the stream-consumer through a signaling server. It recieves input from the consumer, and streams its view to the consumer. 

[![Build Status](https://dev.azure.com/bengreenier/browserd/_apis/build/status/stream-provider?branchName=repo-restructure)](https://dev.azure.com/bengreenier/browserd/_build/latest?definitionId=9&branchName=master)
[![Quality Gate Status](Currently unknown )

## Signaling server

Our service is compatible with any standard WebRTC signaling implementation. If you need a simple one that communicates over HTTP/1.1, [webrtc-signal-http](https://github.com/bengreenier/webrtc-signal-http) is a good option.

## Configuration

Our service can be configured using a [dotenv](https://www.npmjs.com/package/dotenv) file - `.env` containing one environment variable
key and value per line. For example `KEY=value`. Below are the possible options:

+ `SERVICE_URL` (string) - the web service address (to render)
+ `TURN_URL` (string) - a turn address
+ `TURN_USERNAME` (string) - a turn username
+ `TURN_PASSWORD` (string) - a turn password credential
+ `POLL_URL` (string) - a signaling server base address
+ `POLL_INTERVAL` (number) - a signaling poll interval in ms
+ `HEIGHT` (number) - the window height
+ `WIDTH` (number) - the window width
+ `EXP_HIDE_STREAMER` (boolean) - experiment flag for hiding the streamer window
+ `TWILIO_ACCOUNT_SID` (string) - a Twilio AccountSid required to get a Network Traversal Service Token
+ `TWILIO_AUTH_TOKEN` (string) - a Twilio AuthToken required to get a Network Traversal Service Token

## Turn server

Our service supports both [coturn](https://github.com/coturn/coturn) and [Twilio's STUN/TURN service](https://www.twilio.com/docs/stun-turn).
In the dotenv file, if `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` values are set, our service will attempt to get a turn server from Twilio. Otherwise, you can leave them empty to use a stun server or coturn turn server.

## Running

How to get browserd up and running. Please refer the README of the package you would like to run for instructions here. ⚙

[Stream-consumer](https://github.com/bengreenier/browserd/tree/repo-restructure/packages/stream-consumer)
[Stream-provider](https://github.com/bengreenier/browserd/tree/repo-restructure/packages/stream-provider)

```

## Contributing

Coming soon. ✨

## License

MIT

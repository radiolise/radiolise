# @radiolise/api

[![version](https://img.shields.io/npm/v/@radiolise/api?style=for-the-badge)](https://www.npmjs.com/package/@radiolise/api)
[![license](https://img.shields.io/npm/l/@radiolise/api?style=for-the-badge)](LICENSE)

Express API server that powers Radiolise and its metadata retrieval.  
Provides clients with title information from ICY radio streams.

## Setup

Before setting up your own instance, check out
<https://gitlab.com/radiolise/radiolise.gitlab.io/-/blob/master/setup.md>. The
preferred method is to use Docker with Compose.

## Usage

### Official client library

It's recommended to use the official JavaScript wrapper if your code has access
to browser APIs. See
[@radiolise/metadata-client](https://www.npmjs.com/package/@radiolise/metadata-client).

### Manual WebSocket interaction

If your code doesn't belong to a web app, you may want to establish a WebSocket
connection manually. The steps described below are language-agnostic.

In your app, connect to the official backend or
[provide your own instance URL](https://gitlab.com/radiolise/radiolise.gitlab.io/-/blob/master/setup.md):

    wss://backend.radiolise.com/api/data-service

Send a JSON payload with the URL of the station you want to subscribe to:

```json
{
  "action": "subscribe",
  "data": {
    "url": "https://liveradio.swr.de/sw282p3/swr3/play.mp3"
  }
}
```

You should get a message like this on each title update:

```json
{
  "action": "setTitle",
  "data": {
    "title": "Always look on the bright side of life / Monty Python"
  }
}
```

Parse the message as JSON and the title can be extracted (e.g. `.data.title`).

To unsubscribe, just send:

```json
{
  "action": "unsubscribe"
}
```

Whenever the server encounters an error, it's reported like this:

```json
{
  "action": "reportError",
  "data": {
    "type": "malformedPayload",
    "detail": "<optional detail message, omitted for most errors>"
  }
}
```

See the source code for details on error types:
<https://gitlab.com/radiolise/radiolise.gitlab.io/-/blob/master/packages/common/index.ts>

### HTTP interaction

Mainly implemented for backward compatibility with the deprecated PHP service
(<https://gitlab.com/radiolise/deprecated-service>). Prefer WebSockets where
possible as they allow quick, bidirectional and – in this case – more private
communication.

Official URL of the HTTPS endpoint:

    https://backend.radiolise.com/api/v1/metadata

Getting metadata using JSON requests:

```http
POST /api/v1/metadata HTTP/1.1
Host: backend.radiolise.com
Content-Type: application/json

{"url":"https://liveradio.swr.de/sw282p3/swr3/play.mp3"}
```

Using query parameters:

> **Warning**: Query parameters are often persisted in server logs, and with the
> client periodically sending a stream URL, the server owner could find out
> about when users are listening to which stations without using any further
> tools.

```http
GET /api/v1/metadata?url=https://liveradio.swr.de/sw282p3/swr3/play.mp3 HTTP/1.1
Host: backend.radiolise.com
```

A typical response:

```json
{
  "content-type": "audio/mpeg",
  "description": "SWR3",
  "genre": "Pop Music",
  "name": "SWR3 MP3 128",
  "title": "Always look on the bright side of life / Monty Python",
  "url": "https://www.swr3.de/"
}
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2023-present Marco Bauer

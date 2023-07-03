# @radiolise/metadata-client

[![version](https://img.shields.io/npm/v/@radiolise/metadata-client?style=for-the-badge)](https://www.npmjs.com/package/@radiolise/metadata-client)
[![license](https://img.shields.io/npm/l/@radiolise/metadata-client?style=for-the-badge)](LICENSE)

Library for subscribing to metadata of ICY radio streams.  
Powered by the Radiolise API, based on WebSockets.

🪶 Zero dependencies: 1.5 kiB minified  
✨ Reactive: Compatible with RxJS & Co.

## Usage

### Example projects

If you want to use this library with a JS framework, check out the official
example setups. Visit
<https://gitlab.com/radiolise/radiolise.gitlab.io/-/blob/master/examples> to see
more.

### From npm

```sh
npm install @radiolise/metadata-client
```

Code example (pure JavaScript):

```js
import { createMetadataClient } from '@radiolise/metadata-client'

const nowPlaying = createMetadataClient({
  // Official instance URL
  url: 'wss://backend.radiolise.com/api/data-service',
})

// Register subscription handler
const subscription = nowPlaying.subscribe(({ title, error }) => {
  if (!error) {
    console.log('new title': title)
  }
})

nowPlaying.trackStream('https://liveradio.swr.de/sw282p3/swr3/play.mp3')
```

### From CDN

```html
<script src="//unpkg.com/@radiolise/metadata-client@1.0.0"></script>
<script>
  const nowPlaying = RadioliseMetadata.createMetadataClient({ url: '...' })
</script>
```

You can also use the modern ESM build:

```html
<script type="module">
  import { createMetadataClient } from '//unpkg.com/@radiolise/metadata-client@1.0.0/dist/index.js'
  const nowPlaying = createMetadataClient({ url: '...' })
</script>
```

## Declarations

TypeScript definitions included.

The `createMetadataClient` function could be declared like this:

```ts
declare function createMetadataClient(options: {
  url: string | URL
  /** @default true */
  reconnect?: boolean
  /** @default 2000 */
  reconnectDelay?: number | undefined
  onSocketError?: (this: MetadataClient, code: number) => void
})
```

## More actions

### Unregister subscription handler

```js
subscription.unsubscribe()
```

### Stop tracking metadata

```js
nowPlaying.trackStream(undefined)
```

To resume, just call `trackStream` again providing a regular stream URL.

## Error handling

```js
import { createMetadataClient, ErrorTypes } from '@radiolise/metadata-client'

const nowPlaying = createMetadataClient({ url: '...' })

nowPlaying.subscribe(({ title, error }) => {
  if (!error) {
    console.log('new title': title)
    return
  }
  switch (error) {
    case ErrorTypes.MALFORMED_PAYLOAD:
      // The API server was unable to parse the payload because something has
      // been omitted or is invalid.
      break
    case ErrorTypes.SERVER_UNREACHABLE:
      // The provided host is unreachable.
      break
    case ErrorTypes.SERVER_HTTP_ERROR:
      // The streaming server responded with an HTTP status error.
      break
    case ErrorTypes.NON_ICY_RESOURCE:
      // The resource does not appear to be an ICY audio stream.
      break
    default:
      // Other error not documented yet.
  }
})
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2023-present Marco Bauer

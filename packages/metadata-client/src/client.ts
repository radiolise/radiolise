import { NO_OPERATION, PROJECT_NAME } from './constants.js'
import type {
  ClientPayload,
  ErrorTypes,
  ServerPayload,
  SubscribePayload,
  UnsubscribePayload,
} from './shared.js'

declare global {
  interface SymbolConstructor {
    readonly observable: symbol
  }
}

type Handler<T> = (value: T) => void

type Observer<T> =
  | Handler<T>
  | {
      next?: Handler<T>
      error?: Handler<any>
      complete?: Handler<boolean>
    }

export interface NowPlayingInfo {
  title: string
  error?: ErrorTypes
}

function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

function parsePayload(rawData: string) {
  return JSON.parse(rawData) as ServerPayload
}

function unwrapHandler<T>(observer: Observer<T>) {
  return (isFunction(observer) ? observer : observer.next)?.bind(observer)
}

function addHandler<T>(set: Set<Handler<T>>, handler?: Handler<T>) {
  if (!handler) return
  set.add(handler)
}

function deleteHandler<T>(set: Set<Handler<T>>, handler?: Handler<T>) {
  if (!handler) return
  set.delete(handler)
}

function invokeHandlers<T>(handlers: Iterable<Handler<T>>, value: T) {
  for (const handler of handlers) {
    handler(value)
  }
}

interface MetadataClientOptions {
  url: string | URL
  /** @default true */
  reconnect?: boolean
  /** @default 2000 */
  reconnectDelay?: number | undefined
  onSocketError?: (this: MetadataClient, code: number) => void
}

export type MetadataClient = ReturnType<typeof createMetadataClient>

export function createMetadataClient(options: MetadataClientOptions) {
  const { url: socketUrl, reconnect = true, reconnectDelay = 2000 } = options

  const connect = async () => {
    client = new WebSocket(socketUrl, 'v1')

    client.addEventListener('message', (event) => {
      const payload = parsePayload(event.data)
      if (payload.action === 'setTitle') {
        nowPlaying = { title: payload.data.title }
      } else if (payload.action === 'reportError') {
        nowPlaying = { title: '', error: payload.data.type }
      }
      invokeHandlers(updateHandlers, nowPlaying)
    })

    client.addEventListener('close', (event) => {
      if (event.wasClean) {
        return
      }
      onSocketError(event.code)
      if (client && reconnect) {
        setTimeout(connect, reconnectDelay)
      }
    })

    await ensureSocketReady()

    if (streamUrl) {
      trackStream(streamUrl)
    }
  }

  const terminate = () => {
    client?.close()
    client = undefined
  }

  const ensureSocketReady = () => {
    return new Promise<WebSocket>((resolve, reject) => {
      if (client === undefined) {
        return reject(new Error(`[${PROJECT_NAME}] already terminated`))
      }
      if (client.readyState === WebSocket.OPEN) {
        return resolve(client)
      }
      client.addEventListener('open', () => resolve(client!), { once: true })
    })
  }

  const dispatch = async <T extends ClientPayload>(payload: T) => {
    const socket = await ensureSocketReady()
    socket.send(JSON.stringify(payload))
  }

  const trackStream = (url: string | URL | undefined) => {
    streamUrl = url?.toString()
    if (!streamUrl) {
      return dispatch<UnsubscribePayload>({
        action: 'unsubscribe',
      })
    }
    return dispatch<SubscribePayload>({
      action: 'subscribe',
      data: { url: streamUrl as string },
    })
  }

  const subscribe = (observer: Observer<NowPlayingInfo>) => {
    const next = unwrapHandler(observer)
    if (!next) {
      return {
        unsubscribe: NO_OPERATION,
      }
    }
    next(nowPlaying)
    addHandler(updateHandlers, next)
    return {
      unsubscribe: () => {
        deleteHandler(updateHandlers, next)
      },
    }
  }

  const metadataClient = {
    [Symbol.observable || '@@observable']: () => metadataClient,
    trackStream,
    terminate,
    subscribe,
  }

  const updateHandlers = new Set<Handler<NowPlayingInfo>>()
  let client: WebSocket | undefined
  let nowPlaying: NowPlayingInfo = { title: '' }
  let streamUrl: string | undefined

  const onSocketError =
    options.onSocketError?.bind(metadataClient) ?? NO_OPERATION

  connect()

  return metadataClient
}

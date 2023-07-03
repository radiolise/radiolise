import type { Response } from 'node-fetch'

import { setupMetadataReceiver } from './analysis.js'
import { publishError, publishTitle } from './publishing.js'
import type { ErrorData } from './shared.js'
import type { RadioliseSocket } from './socket.js'

interface MetadataSummary {
  'content-type': string | null
  'description': string | null
  'genre': string | null
  'name': string | null
  'title': string
  'url': string | null
}

interface MetadataHandlerPayload {
  summary?: MetadataSummary
  error?: ErrorData
}

type MetadataHandler = (payload: MetadataHandlerPayload) => void

interface StreamData {
  readonly processResult: () => void
  readonly onceResultProcessed: (handler: MetadataHandler) => void
  readonly getResponse: () => Promise<Response>
  readonly sockets: Set<RadioliseSocket>
  readonly nowPlaying: string | undefined
  readonly destroy: () => void
}

interface StreamDataStore {
  [url: string]: StreamData | undefined
}

export const streamDataStore: StreamDataStore = {}

export function obtainStreamData(url: string) {
  if (streamDataStore[url]) {
    const streamData = streamDataStore[url]!
    streamData.processResult()
    return streamData
  }

  const sockets = new Set<RadioliseSocket>()
  let nowPlaying: string | undefined
  const metadataHandlers = new Set<MetadataHandler>()

  const { cleanup, getResponse } = setupMetadataReceiver({
    url,
    publish: async (title) => {
      publishTitle(sockets, title)
      nowPlaying = title
      processResult()
    },
    fail: (type) => {
      publishError(sockets, { type })
      processResult()
      destroy()
    },
  })

  const invokeMetadataHandlers = (payload: MetadataHandlerPayload) => {
    for (const invoke of metadataHandlers) {
      invoke(payload)
    }
  }

  const processResult = async () => {
    if (metadataHandlers.size === 0) {
      return
    }
    try {
      const { headers } = await getResponse()
      if (!nowPlaying) {
        return
      }
      invokeMetadataHandlers({
        summary: {
          'content-type': headers.get('content-type'),
          'description': headers.get('icy-description'),
          'genre': headers.get('icy-genre'),
          'name': headers.get('icy-name'),
          'title': nowPlaying,
          'url': headers.get('icy-url'),
        },
      })
    } catch (error) {
      const { type } = error as ErrorData
      invokeMetadataHandlers({
        error: { type },
      })
    }
    metadataHandlers.clear()
    cleanupStreamData(url)
  }

  const onceResultProcessed = async (handler: MetadataHandler) => {
    metadataHandlers.add(handler)
    processResult()
  }

  const destroy = () => {
    cleanup()
    delete streamDataStore[url]
  }

  const streamData: StreamData = {
    processResult,
    onceResultProcessed,
    getResponse,
    sockets,
    get nowPlaying() {
      return nowPlaying
    },
    destroy,
  }

  streamDataStore[url] = streamData
  return streamData
}

export function cleanupStreamData(url: string) {
  const streamData = streamDataStore[url]
  if (streamData && streamData.sockets.size === 0) {
    streamData.destroy()
  }
}

export function getNowPlayingInfo(url: string) {
  return streamDataStore[url]?.nowPlaying
}

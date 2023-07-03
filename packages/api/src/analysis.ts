import type { Readable } from 'node:stream'

import fetch, { Headers, Request } from 'node-fetch'

import { ErrorTypes, VERSION } from './shared.js'

interface Metadata {
  StreamTitle: string
  StreamUrl?: string
  adw_ad?: string
  durationMilliseconds?: string
  adId?: string
  insertionType?: string
  AdCreativeId?: string
  AdTitle?: string
  Advertiser?: string
  [key: string]: unknown
}

enum Actions {
  PASS_NEXT_SEGMENT,
  DECODE_METADATA_SIZE,
  EXTRACT_TITLE,
}

function safeRead(
  stream: Readable,
  bytes: number,
  proceedHandler: (chunk: Buffer) => void
) {
  if (stream.readableLength >= bytes) {
    proceedHandler(stream.read(bytes))
  }
}

function isAdvertisement(metadata: Metadata) {
  return (metadata['AdCreativeId'] || metadata['adw_ad']) !== undefined
}

function parseMetadata(raw: string) {
  const result = {} as Metadata
  for (const match of raw.split("';")) {
    const [key, value] = match.split("='")
    if (value === undefined) continue
    result[key] = value
  }
  return result
}

const defaultHeaders = new Headers({
  'Icy-MetaData': '1',
  'User-Agent': `radiolise-service/${VERSION}`,
})

interface ReceiveContext {
  request: Request
  publish: (title: string) => void
  abort: () => void
}

interface SetupOptions {
  url: string
  publish: ReceiveContext['publish']
  fail: (errorType: ErrorTypes) => void
}

class AnalyzerError extends Error {
  public type: ErrorTypes

  constructor(options: { type: ErrorTypes; message?: string }) {
    super(options.message)
    this.type = options.type
  }
}

async function analyzeStream(context: ReceiveContext) {
  const response = await fetch(context.request).catch(() => {
    throw new AnalyzerError({ type: ErrorTypes.SERVER_UNREACHABLE })
  })

  if (!response.ok) {
    throw new AnalyzerError({ type: ErrorTypes.SERVER_HTTP_ERROR })
  }

  const metaIntervalHeader = response.headers.get('icy-metaint')
  if (metaIntervalHeader === null) {
    throw new AnalyzerError({
      type: ErrorTypes.NON_ICY_RESOURCE,
      message: 'resource does not support Icy-MetaData',
    })
  }

  const stream = response.body as Readable
  const metaInterval = Number(metaIntervalHeader)

  let currentData: string
  let action = Actions.PASS_NEXT_SEGMENT
  let decodedMetadataSize = 0

  const restart = () => {
    context.abort()
    analyzeStream(context)
  }

  const passNextSegment = () => {
    action = Actions.PASS_NEXT_SEGMENT
    safeRead(stream, metaInterval, decodeMetadataSize)
  }

  const decodeMetadataSize = () => {
    action = Actions.DECODE_METADATA_SIZE
    safeRead(stream, 1, (chunk) => {
      decodedMetadataSize = chunk[0] << 4
      if (decodedMetadataSize === 0) {
        return passNextSegment()
      }
      extractTitle()
    })
  }

  const extractTitle = () => {
    action = Actions.EXTRACT_TITLE
    safeRead(stream, decodedMetadataSize, (chunk) => {
      const decoded = chunk.toString('utf8')
      if (currentData === decoded) {
        return passNextSegment()
      }
      currentData = decoded
      const parsed = parseMetadata(decoded)
      if (isAdvertisement(parsed)) {
        return passNextSegment()
      }
      context.publish(parsed['StreamTitle'])
      passNextSegment()
    })
  }

  stream.on('readable', () => {
    if (action === Actions.PASS_NEXT_SEGMENT) return passNextSegment()
    if (action === Actions.DECODE_METADATA_SIZE) return decodeMetadataSize()
    if (action === Actions.EXTRACT_TITLE) return extractTitle()
  })

  stream.on('end', () => {
    restart()
  })

  return response
}

export function setupMetadataReceiver({ url, publish, fail }: SetupOptions) {
  const controller = new AbortController()
  const abort = () => controller.abort()

  const request = new Request(url, {
    signal: controller.signal,
    headers: defaultHeaders,
  })
  const analyzerPromise = analyzeStream({ request, publish, abort })
  analyzerPromise.catch((error) => {
    if (error instanceof AnalyzerError) {
      fail(error.type)
    }
  })
  return { cleanup: abort, getResponse: () => analyzerPromise }
}

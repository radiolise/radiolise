import { WebSocket, type RawData } from 'ws'

import { parsePayload } from './payloads.js'
import {
  cleanupStreamData,
  getNowPlayingInfo,
  obtainStreamData,
  streamDataStore,
} from './processing.js'
import { publishError, publishTitle } from './publishing.js'
import { ERROR_UNSUPPORTED_URL, ErrorTypes } from './shared.js'

export class RadioliseSocket extends WebSocket {
  isAlive = true
  streamUrl!: string

  constructor(_address: any, _protocols?: any, _options?: any) {
    super(_address, _protocols, _options)
    this.on('message', this._handleMessage)
    this.on('pong', this._handlePong)
    this.on('close', this._handleClose)
  }

  *[Symbol.iterator]() {
    yield this
  }

  private _handleMessage(rawData: RawData) {
    const textData = rawData.toString('utf8')
    const payload = parsePayload(textData)

    if (!payload) {
      return publishError(this, {
        type: ErrorTypes.MALFORMED_PAYLOAD,
        detail: parsePayload.message,
      })
    }
    if (payload.action === 'subscribe') {
      return this._subscribe(payload.data.url)
    }
    if (payload.action === 'unsubscribe') {
      return this._unsubscribe()
    }
  }

  private _handlePong() {
    this.isAlive = true
  }

  private _handleClose() {
    this._unsubscribe()
  }

  private _subscribe(url: string) {
    if (streamDataStore[url]?.sockets.has(this)) {
      publishTitle(this, getNowPlayingInfo(url))
      return
    }

    this._unsubscribe()

    try {
      const { sockets } = obtainStreamData(url)
      this.streamUrl = url
      sockets.add(this)
      publishTitle(this, getNowPlayingInfo(url))
    } catch {
      publishError(this, ERROR_UNSUPPORTED_URL)
    }
  }

  private _unsubscribe() {
    const streamData = streamDataStore[this.streamUrl]
    if (streamData) {
      streamData.sockets.delete(this)
      cleanupStreamData(this.streamUrl)
    }
  }
}

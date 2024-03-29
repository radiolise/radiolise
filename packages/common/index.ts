export interface SubscribePayload {
  action: 'subscribe'
  data: {
    url: string
  }
}

export interface UnsubscribePayload {
  action: 'unsubscribe'
}

export interface SetTitlePayload {
  action: 'setTitle'
  data: {
    title: string
  }
}

export interface ErrorData {
  type: ErrorTypes
  detail?: string
}

export interface ErrorPayload {
  action: 'reportError'
  data: ErrorData
}

export enum ErrorTypes {
  /**
   * The API server was unable to parse the payload because something has been
   * omitted or is invalid.
   */
  MALFORMED_PAYLOAD = 'malformedPayload',
  /**
   * The provided host is unreachable.
   */
  SERVER_UNREACHABLE = 'serverUnreachable',
  /**
   * The server responded with an HTTP status error.
   */
  SERVER_HTTP_ERROR = 'serverHttpError',
  /**
   * The resource does not appear to be an ICY audio stream.
   */
  NON_ICY_RESOURCE = 'nonIcyResource',
}

export type ClientPayload = SubscribePayload | UnsubscribePayload
export type ServerPayload = SetTitlePayload | ErrorPayload

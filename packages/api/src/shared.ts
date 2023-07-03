import { ErrorTypes, type ErrorData } from '@radiolise/common'

export {
  name as PROJECT_NAME,
  version as VERSION,
  homepage as HOMEPAGE,
} from '../package.json'

export const ERROR_UNSUPPORTED_URL: ErrorData = {
  type: ErrorTypes.MALFORMED_PAYLOAD,
  detail: 'stream URL not supported or missing',
}

export const USE_REST_ENDPOINTS = true
export const CURRENT_WS_PROTOCOL = 'v1'

export * from '@radiolise/common'

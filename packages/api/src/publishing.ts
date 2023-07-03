import type {
  ErrorData,
  ErrorPayload,
  ServerPayload,
  SetTitlePayload,
} from './shared.js'
import type { RadioliseSocket } from './socket.js'

function dispatch<T extends ServerPayload>(
  sockets: Iterable<RadioliseSocket>,
  payload: T
) {
  for (const socket of sockets) {
    socket.send(JSON.stringify(payload))
  }
}

export function publishError(
  sockets: Iterable<RadioliseSocket>,
  data: ErrorData
) {
  dispatch<ErrorPayload>(sockets, {
    action: 'reportError',
    data,
  })
}

export function publishTitle(
  sockets: Iterable<RadioliseSocket>,
  title?: string
) {
  if (!title) {
    return
  }
  dispatch<SetTitlePayload>(sockets, {
    action: 'setTitle',
    data: { title },
  })
}

import cors from 'cors'
import express from 'express'
import type { Express } from 'express-serve-static-core'
import { WebSocketServer } from 'ws'

import { enableRestEndpoints } from './api.js'
import { USE_REST_ENDPOINTS } from './shared.js'
import { RadioliseSocket } from './socket.js'

export async function createServer(
  port: number,
  host = '',
  middlewareHandler?: (app: Express) => any
) {
  const app: Express = express()
  app.disable('x-powered-by')

  app.use(cors())

  // Process this first so the backend doesn't claim any paths used here.
  await middlewareHandler?.(app)

  if (USE_REST_ENDPOINTS) {
    enableRestEndpoints(app)
  }

  const wss = new WebSocketServer<RadioliseSocket>({
    noServer: true,
    path: '/api/data-service',
    WebSocket: RadioliseSocket,
  })

  const server = app.listen(port, host)

  server.on('upgrade', (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
      wss.emit('connection', socket, request)
    })
  })

  const interval = setInterval(() => {
    for (const client of wss.clients) {
      if (!client.isAlive) {
        // Close due to inactivity
        client.terminate()
        continue
      }

      client.isAlive = false
      client.ping()
    }
  }, 30_000)

  wss.on('close', () => {
    clearInterval(interval)
  })
}

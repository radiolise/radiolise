import express from 'express'
import type { Express } from 'express-serve-static-core'

import { router } from './routing.js'
import { HOMEPAGE, PROJECT_NAME, VERSION } from './shared.js'

export const CURRENT_API_ROOT = '/api/v1'
export const SERVICE_ENDPOINT = '/api/data-service'

export function enableRestEndpoints(app: Express) {
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(CURRENT_API_ROOT, router)

  app.get('/', (_request, response) => {
    response.redirect('/api')
  })

  app.get('/api', (request, response) => {
    const protocol = request.get('X-Forwarded-Proto') ?? request.protocol
    const host = request.get('X-Forwarded-Host') ?? request.get('Host')
    const origin = `${protocol}://${host}`

    response.set('Content-Type', 'application/json')
    response.end(
      JSON.stringify(
        {
          packageName: PROJECT_NAME,
          packageVersion: VERSION,
          packageHomepage: HOMEPAGE,
          websocketPath: `${origin.replace('http', 'ws')}${SERVICE_ENDPOINT}`,
          routes: router.stack.map(({ route }) => ({
            path: `${CURRENT_API_ROOT}${route.path}`,
            methods: route.methods,
          })),
          examples: [
            `${origin}${CURRENT_API_ROOT}/metadata?url=https://liveradio.swr.de/sw282p3/swr3/play.mp3`,
          ],
        },
        undefined,
        2
      )
    )
  })
}

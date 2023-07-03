import { Router, type Request, type Response } from 'express'

import { obtainStreamData } from './processing.js'
import { ERROR_UNSUPPORTED_URL } from './shared.js'

export const router = Router()

function handleMetadataRequest(request: Request, response: Response) {
  const url = (request.query.url || request.body.url) as string
  try {
    const streamData = obtainStreamData(url)
    streamData.onceResultProcessed(({ summary, error }) => {
      if (error) {
        return response.status(400).json(error)
      }
      response.json(summary)
    })
  } catch {
    response.status(400).json(ERROR_UNSUPPORTED_URL)
  }
}

router.get('/metadata', handleMetadataRequest)
router.post('/metadata', handleMetadataRequest)

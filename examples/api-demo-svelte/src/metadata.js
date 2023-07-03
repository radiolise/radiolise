import { createMetadataClient } from '@radiolise/metadata-client'

export const nowPlaying = createMetadataClient({
  url: 'wss://backend.radiolise.com/api/data-service',
})

import { PROJECT_NAME } from './shared.js'

import { createServer } from './index.js'

const port = (process.env.PORT ?? 3000) as number

await createServer(port)
console.log(`[${PROJECT_NAME}]`)
console.log(`Listening internally on port ${port}.`)

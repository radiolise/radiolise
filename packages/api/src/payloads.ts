import jtd, { type JTDSchemaType } from 'ajv/dist/jtd.js'

import type { ClientPayload } from './shared.js'

const { default: Ajv } = jtd
const validator = new Ajv()

const schema: JTDSchemaType<ClientPayload> = {
  discriminator: 'action',
  mapping: {
    subscribe: {
      properties: {
        data: {
          properties: {
            url: { type: 'string' },
          },
        },
      },
    },
    unsubscribe: {
      optionalProperties: {},
    },
  },
}

export const parsePayload = validator.compileParser(schema)

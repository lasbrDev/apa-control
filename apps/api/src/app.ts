import Decimal from 'decimal.js'
import fastify from 'fastify'

import cors from '@fastify/cors'
import multiPart from '@fastify/multipart'

import { registerRoutes } from './routes'
import { exceptionHandler } from './utils/fastify/exceptionHandler'
import { ipHandler } from './utils/fastify/ipHandler'
import { notFoundHandler } from './utils/fastify/notFoundHandler'

Decimal.prototype.toJSON = function () {
  return this.toNumber() as unknown as string
}

const app = fastify({ ignoreTrailingSlash: true, caseSensitive: false })

app.setErrorHandler(exceptionHandler)
app.setNotFoundHandler(notFoundHandler)
app.addHook('onRequest', ipHandler)
app.register(cors, { exposedHeaders: ['X-Total-Count'], credentials: true })
app.register(multiPart, { limits: { fileSize: 15 * 1024 * 1024 } })
app.register(registerRoutes, { prefix: '/' })

export { app }

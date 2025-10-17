import { ZodError } from 'zod'

import { logError } from '../../logger'
import type { ApiError } from '../ApiError'

import type { FastifyReply, FastifyRequest } from 'fastify'

export function exceptionHandler(error: ApiError, request: FastifyRequest, reply: FastifyReply) {
  const statusCode = error instanceof ZodError ? 422 : error.statusCode || 500
  const message = error instanceof ZodError ? error.issues[0].message : error.message
  const errorPayload = { message }

  if (statusCode === 500) {
    logError(error, {
      user: request.user,
      body: request.body,
      params: request.params,
      query: request.query,
      ipAddress: request.ipAddress,
      userAgent: request.headers['user-agent'],
    })
  }

  return reply.status(statusCode).send(errorPayload)
}

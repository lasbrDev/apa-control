import * as Sentry from '@sentry/node'
import { ZodError } from 'zod'

import { logError } from '@/logger'

import type { ApiError } from '@/utils/api-error'
import type { FastifyReply, FastifyRequest } from 'fastify'

function isDatabaseConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const errorMessage = error.message.toLowerCase()
  const errorCode = (error as { code?: string })?.code

  const connectionErrorCodes = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'EPIPE',
    'ETIMEDOUT',
    'ENETUNREACH',
  ]

  // Mensagens de erro comuns de conexão
  const connectionErrorMessages = [
    'connection',
    'timeout',
    'connect',
    'failed query',
    'connection terminated',
    'server closed the connection',
    'no connection',
    'pool',
  ]

  return (
    connectionErrorCodes.some((code) => errorCode === code) ||
    connectionErrorMessages.some((msg) => errorMessage.includes(msg))
  )
}

export function exceptionHandler(error: ApiError, request: FastifyRequest, reply: FastifyReply) {
  if (error.statusCode === 429) {
    return reply.status(429).send({ message: 'Muitas solicitações, tente novamente mais tarde.' })
  }

  const statusCode = error instanceof ZodError ? 422 : error.statusCode || 500

  let message: string
  if (error instanceof ZodError) {
    message = error.issues[0].message
  } else if (isDatabaseConnectionError(error)) {
    message = 'Erro de conexão com o banco de dados. Por favor, tente novamente em alguns instantes.'
  } else {
    message = error.message
  }

  const errorPayload = { message }

  if (statusCode === 500) {
    Sentry.captureException(error, {
      extra: {
        user: request.user,
        body: request.body,
        params: request.params,
        query: request.query,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        isDatabaseError: isDatabaseConnectionError(error),
      },
    })

    logError(error, {
      user: request.user,
      body: request.body,
      params: request.params,
      query: request.query,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      isDatabaseError: isDatabaseConnectionError(error),
    })
  }

  return reply.status(statusCode).send(errorPayload)
}

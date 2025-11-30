import { env } from '@/env'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function healthController(_request: FastifyRequest, reply: FastifyReply) {
  return reply.status(200).send({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    app: env.APP_NAME,
  })
}

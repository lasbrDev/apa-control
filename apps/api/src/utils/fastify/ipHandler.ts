import requestIp from 'request-ip'

import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    ipAddress: string | null
  }
}

export function ipHandler(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
  request.ipAddress = requestIp.getClientIp({ headers: request.headers, socket: request.socket })
  done()
}

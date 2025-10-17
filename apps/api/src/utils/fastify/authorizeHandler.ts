import jwt from 'jsonwebtoken'

import { env } from '../../env'

import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user: TokenOperator
  }
}

const secret = env.APP_SECRET

export function authorize(...roles: string[]) {
  return {
    preHandler: [
      (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
        const authHeader = request.headers.authorization

        if (!authHeader) {
          reply.status(401).send({ message: 'Token não informada!' })
          return done()
        }

        const [, token] = authHeader.split(' ')

        try {
          const decoded = <TokenOperator>jwt.verify(token, secret)

          request.user = decoded

          return done()
        } catch (err) {
          reply.status(401).send({ message: 'Token inválida!' })
          return done(<Error>err)
        }
      },
      (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
        if (roles.length && !roles.some((role) => request.user.roles.includes(role))) {
          return reply.status(403).send({ message: 'Você não tem permissão pra executar essa ação!' })
        }

        return done()
      },
    ],
  }
}

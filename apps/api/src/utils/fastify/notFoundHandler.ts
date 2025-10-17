import type { FastifyReply, FastifyRequest } from 'fastify'

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  reply
    .code(404)
    .type('text/html')
    .send(`<!DOCTYPE html><html lang="pt-BR"><head><title>APA Control</title></head></html>`)
}

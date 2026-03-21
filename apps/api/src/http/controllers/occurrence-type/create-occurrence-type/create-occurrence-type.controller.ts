import { makeCreateOccurrenceTypeUseCase } from '@/use-cases/occurrence-type/create-occurrence-type/create-occurrence-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createOccurrenceTypeSchema } from './create-occurrence-type.schema'

export async function createOccurrenceTypeController(request: FastifyRequest, reply: FastifyReply) {
  const body = createOccurrenceTypeSchema.parse(request.body)
  const useCase = makeCreateOccurrenceTypeUseCase()
  const id = await useCase.execute(body)
  return reply.status(201).send({ id })
}

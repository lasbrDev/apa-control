import { makeRemoveOccurrenceTypeUseCase } from '@/use-cases/occurrence-type/remove-occurrence-type/remove-occurrence-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeOccurrenceTypeSchema } from './remove-occurrence-type.schema'

export async function removeOccurrenceTypeController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeOccurrenceTypeSchema.parse(request.params)
  const useCase = makeRemoveOccurrenceTypeUseCase()
  await useCase.execute(id)
  return reply.status(204).send()
}

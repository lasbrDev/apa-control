import { makeUpdateOccurrenceTypeUseCase } from '@/use-cases/occurrence-type/update-occurrence-type/update-occurrence-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateOccurrenceTypeSchema } from './update-occurrence-type.schema'

export async function updateOccurrenceTypeController(request: FastifyRequest, reply: FastifyReply) {
  const body = updateOccurrenceTypeSchema.parse(request.body)
  const useCase = makeUpdateOccurrenceTypeUseCase()
  await useCase.execute(body)
  return reply.status(204).send()
}

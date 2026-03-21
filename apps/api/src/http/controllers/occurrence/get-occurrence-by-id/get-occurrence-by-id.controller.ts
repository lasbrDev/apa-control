import { makeGetOccurrenceByIdUseCase } from '@/use-cases/occurrence/get-occurrence-by-id/get-occurrence-by-id.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getOccurrenceByIdSchema } from './get-occurrence-by-id.schema'

export async function getOccurrenceByIdController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = getOccurrenceByIdSchema.parse(request.params)
  const useCase = makeGetOccurrenceByIdUseCase()
  const item = await useCase.execute(id)
  return reply.status(200).send(item)
}

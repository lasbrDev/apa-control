import { makeGetOccurrenceTypeByIdUseCase } from '@/use-cases/occurrence-type/get-occurrence-type-by-id/get-occurrence-type-by-id.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getOccurrenceTypeByIdSchema } from './get-occurrence-type-by-id.schema'

export async function getOccurrenceTypeByIdController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = getOccurrenceTypeByIdSchema.parse(request.params)
  const useCase = makeGetOccurrenceTypeByIdUseCase()
  const item = await useCase.execute(id)
  return reply.status(200).send(item)
}

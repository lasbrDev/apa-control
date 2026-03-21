import { makeRemoveOccurrenceUseCase } from '@/use-cases/occurrence/remove-occurrence/remove-occurrence.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeOccurrenceSchema } from './remove-occurrence.schema'

export async function removeOccurrenceController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeOccurrenceSchema.parse(request.params)
  const employeeId = request.user.id
  const useCase = makeRemoveOccurrenceUseCase()
  await useCase.execute(id, employeeId)
  return reply.status(204).send()
}

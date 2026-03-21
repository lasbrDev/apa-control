import { makeUpdateOccurrenceUseCase } from '@/use-cases/occurrence/update-occurrence/update-occurrence.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateOccurrenceSchema } from './update-occurrence.schema'

export async function updateOccurrenceController(request: FastifyRequest, reply: FastifyReply) {
  const body = updateOccurrenceSchema.parse(request.body)
  const employeeId = request.user.id
  const useCase = makeUpdateOccurrenceUseCase()
  await useCase.execute(body, employeeId)
  return reply.status(204).send()
}

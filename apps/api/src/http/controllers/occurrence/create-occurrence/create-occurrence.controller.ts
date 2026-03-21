import { makeCreateOccurrenceUseCase } from '@/use-cases/occurrence/create-occurrence/create-occurrence.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createOccurrenceSchema } from './create-occurrence.schema'

export async function createOccurrenceController(request: FastifyRequest, reply: FastifyReply) {
  const body = createOccurrenceSchema.parse(request.body)
  const employeeId = request.user.id
  const useCase = makeCreateOccurrenceUseCase()
  const id = await useCase.execute(body, employeeId)
  return reply.status(201).send({ id })
}

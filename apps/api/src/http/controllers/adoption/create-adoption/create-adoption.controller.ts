import { makeCreateAdoptionUseCase } from '@/use-cases/adoption/create-adoption/create-adoption.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAdoptionSchema } from './create-adoption.schema'

export async function createAdoptionController(request: FastifyRequest, reply: FastifyReply) {
  const body = createAdoptionSchema.parse(request.body)
  const employeeId = request.user.id

  const createAdoptionUseCase = makeCreateAdoptionUseCase()
  const id = await createAdoptionUseCase.execute(body, employeeId)

  return reply.status(201).send({ id })
}

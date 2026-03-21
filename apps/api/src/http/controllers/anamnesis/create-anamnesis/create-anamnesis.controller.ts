import { makeCreateAnamnesisUseCase } from '@/use-cases/anamnesis/create-anamnesis/create-anamnesis.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAnamnesisSchema } from './create-anamnesis.schema'

export async function createAnamnesisController(request: FastifyRequest, reply: FastifyReply) {
  const body = createAnamnesisSchema.parse(request.body)
  const employeeId = request.user.id

  const useCase = makeCreateAnamnesisUseCase()
  const id = await useCase.execute(body, employeeId)

  return reply.status(201).send({ id })
}

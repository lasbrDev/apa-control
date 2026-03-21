import { makeUpdateAnamnesisUseCase } from '@/use-cases/anamnesis/update-anamnesis/update-anamnesis.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAnamnesisSchema } from './update-anamnesis.schema'

export async function updateAnamnesisController(request: FastifyRequest, reply: FastifyReply) {
  const body = updateAnamnesisSchema.parse(request.body)
  const employeeId = request.user.id

  const useCase = makeUpdateAnamnesisUseCase()
  await useCase.execute(body, employeeId)

  return reply.status(204).send()
}

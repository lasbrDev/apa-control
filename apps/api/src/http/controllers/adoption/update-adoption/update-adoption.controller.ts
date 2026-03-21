import { makeUpdateAdoptionUseCase } from '@/use-cases/adoption/update-adoption/update-adoption.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAdoptionSchema } from './update-adoption.schema'

export async function updateAdoptionController(request: FastifyRequest, reply: FastifyReply) {
  const body = updateAdoptionSchema.parse(request.body)

  const updateAdoptionUseCase = makeUpdateAdoptionUseCase()
  await updateAdoptionUseCase.execute(body)

  return reply.status(204).send()
}

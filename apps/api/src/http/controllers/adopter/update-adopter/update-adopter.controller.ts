import { makeUpdateAdopterUseCase } from '@/use-cases/adopter/update-adopter/update-adopter.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAdopterSchema } from './update-adopter.schema'

export async function updateAdopterController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateAdopterSchema.parse(request.body)

  const updateAdopterUseCase = makeUpdateAdopterUseCase()
  await updateAdopterUseCase.execute(data)

  return reply.status(204).send()
}

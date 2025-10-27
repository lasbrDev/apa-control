import { makeCreateAdopterUseCase } from '@/use-cases/adopter/create-adopter/create-adopter.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAdopterSchema } from './create-adopter.schema'

export async function createAdopterController(request: FastifyRequest, reply: FastifyReply) {
  const data = createAdopterSchema.parse(request.body)
  const createAdopterUseCase = makeCreateAdopterUseCase()

  const { id } = await createAdopterUseCase.execute(data)
  return reply.status(201).send({ id })
}

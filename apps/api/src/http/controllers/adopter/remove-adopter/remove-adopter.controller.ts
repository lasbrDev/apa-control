import { db } from '@/database/client'
import { makeRemoveAdopterUseCase } from '@/use-cases/adopter/remove-adopter/remove-adopter.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeAdopterSchema } from './remove-adopter.schema'

export async function removeAdopterController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeAdopterSchema.parse(request.params)

  const removeAdopterUseCase = makeRemoveAdopterUseCase()
  await db.transaction((dbTransaction) => removeAdopterUseCase.execute({ id }, dbTransaction))

  return reply.status(204).send()
}

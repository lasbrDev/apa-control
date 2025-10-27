import { db } from '@/database/client'
import { makeRemoveFinalDestinationTypeUseCase } from '@/use-cases/final-destination-type/remove-final-destination-type/remove-final-destination-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeFinalDestinationTypeSchema } from './remove-final-destination-type.schema'

export async function removeFinalDestinationTypeController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeFinalDestinationTypeSchema.parse(request.params)

  const removeFinalDestinationTypeUseCase = makeRemoveFinalDestinationTypeUseCase()
  await db.transaction((dbTransaction) => removeFinalDestinationTypeUseCase.execute({ id }, dbTransaction))

  return reply.status(204).send()
}

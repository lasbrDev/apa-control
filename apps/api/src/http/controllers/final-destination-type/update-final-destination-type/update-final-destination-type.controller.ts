import { makeUpdateFinalDestinationTypeUseCase } from '@/use-cases/final-destination-type/update-final-destination-type/update-final-destination-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateFinalDestinationTypeSchema } from './update-final-destination-type.schema'

export async function updateFinalDestinationTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateFinalDestinationTypeSchema.parse(request.body)

  const updateFinalDestinationTypeUseCase = makeUpdateFinalDestinationTypeUseCase()
  await updateFinalDestinationTypeUseCase.execute(data)

  return reply.status(204).send()
}

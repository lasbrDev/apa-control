import { makeCreateFinalDestinationTypeUseCase } from '@/use-cases/final-destination-type/create-final-destination-type/create-final-destination-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createFinalDestinationTypeSchema } from './create-final-destination-type.schema'

export async function createFinalDestinationTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = createFinalDestinationTypeSchema.parse(request.body)
  const createFinalDestinationTypeUseCase = makeCreateFinalDestinationTypeUseCase()

  const { id } = await createFinalDestinationTypeUseCase.execute(data)
  return reply.status(201).send({ id })
}

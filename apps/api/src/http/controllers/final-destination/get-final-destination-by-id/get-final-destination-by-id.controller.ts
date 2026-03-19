import { makeGetFinalDestinationByIdUseCase } from '@/use-cases/final-destination/get-final-destination-by-id/get-final-destination-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getFinalDestinationByIdSchema } from './get-final-destination-by-id.schema'

export async function getFinalDestinationByIdController(request: FastifyRequest) {
  const { id } = getFinalDestinationByIdSchema.parse(request.params)

  const getFinalDestinationByIdUseCase = makeGetFinalDestinationByIdUseCase()
  const result = await getFinalDestinationByIdUseCase.execute({ id })

  return result
}

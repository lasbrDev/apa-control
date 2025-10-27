import { makeGetFinalDestinationTypeByIdUseCase } from '@/use-cases/final-destination-type/get-final-destination-type-by-id/get-final-destination-type-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getFinalDestinationTypeByIdSchema } from './get-final-destination-type-by-id.schema'

export async function getFinalDestinationTypeByIdController(request: FastifyRequest) {
  const { id } = getFinalDestinationTypeByIdSchema.parse(request.params)

  const getFinalDestinationTypeByIdUseCase = makeGetFinalDestinationTypeByIdUseCase()
  const result = await getFinalDestinationTypeByIdUseCase.execute({ id })

  return result
}

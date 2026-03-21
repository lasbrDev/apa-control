import { makeGetAdoptionByIdUseCase } from '@/use-cases/adoption/get-adoption-by-id/get-adoption-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getAdoptionByIdSchema } from './get-adoption-by-id.schema'

export async function getAdoptionByIdController(request: FastifyRequest) {
  const { id } = getAdoptionByIdSchema.parse(request.params)

  const getAdoptionByIdUseCase = makeGetAdoptionByIdUseCase()
  return await getAdoptionByIdUseCase.execute({ id })
}

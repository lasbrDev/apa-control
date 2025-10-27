import { makeGetAdopterByIdUseCase } from '@/use-cases/adopter/get-adopter-by-id/get-adopter-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getAdopterByIdSchema } from './get-adopter-by-id.schema'

export async function getAdopterByIdController(request: FastifyRequest) {
  const { id } = getAdopterByIdSchema.parse(request.params)

  const getAdopterByIdUseCase = makeGetAdopterByIdUseCase()
  const result = await getAdopterByIdUseCase.execute({ id })

  return result
}

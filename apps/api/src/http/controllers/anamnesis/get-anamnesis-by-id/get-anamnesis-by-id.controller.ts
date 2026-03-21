import { makeGetAnamnesisByIdUseCase } from '@/use-cases/anamnesis/get-anamnesis-by-id/get-anamnesis-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getAnamnesisByIdSchema } from './get-anamnesis-by-id.schema'

export async function getAnamnesisByIdController(request: FastifyRequest) {
  const { id } = getAnamnesisByIdSchema.parse(request.params)
  const useCase = makeGetAnamnesisByIdUseCase()
  return await useCase.execute({ id })
}

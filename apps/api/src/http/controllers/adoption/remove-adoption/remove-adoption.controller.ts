import { makeRemoveAdoptionUseCase } from '@/use-cases/adoption/remove-adoption/remove-adoption.factory'
import type { FastifyRequest } from 'fastify'
import { removeAdoptionSchema } from './remove-adoption.schema'

export async function removeAdoptionController(request: FastifyRequest) {
  const { id } = removeAdoptionSchema.parse(request.params)

  const removeAdoptionUseCase = makeRemoveAdoptionUseCase()
  await removeAdoptionUseCase.execute({ id })

  return { message: 'Adoção removida com sucesso' }
}

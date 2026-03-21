import { makeRemoveAnamnesisUseCase } from '@/use-cases/anamnesis/remove-anamnesis/remove-anamnesis.factory'
import type { FastifyRequest } from 'fastify'
import { removeAnamnesisSchema } from './remove-anamnesis.schema'

export async function removeAnamnesisController(request: FastifyRequest) {
  const { id } = removeAnamnesisSchema.parse(request.params)
  const employeeId = request.user.id

  const useCase = makeRemoveAnamnesisUseCase()
  await useCase.execute({ id }, employeeId)

  return { message: 'Anamnese removida com sucesso' }
}

import { makeRemoveRescueUseCase } from '@/use-cases/rescue/remove-rescue/remove-rescue.factory'
import type { FastifyRequest } from 'fastify'
import { removeRescueSchema } from './remove-rescue.schema'

export async function removeRescueController(request: FastifyRequest) {
  const { id } = removeRescueSchema.parse(request.params)

  const removeRescueUseCase = makeRemoveRescueUseCase()
  const employeeId = request.user.id

  await removeRescueUseCase.execute({ id, employeeId })

  return { message: 'Resgate removido com sucesso' }
}

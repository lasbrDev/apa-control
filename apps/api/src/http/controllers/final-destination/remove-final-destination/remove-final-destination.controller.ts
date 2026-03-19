import { makeRemoveFinalDestinationUseCase } from '@/use-cases/final-destination/remove-final-destination/remove-final-destination.factory'
import type { FastifyRequest } from 'fastify'
import { removeFinalDestinationSchema } from './remove-final-destination.schema'

export async function removeFinalDestinationController(request: FastifyRequest) {
  const { id } = removeFinalDestinationSchema.parse(request.params)
  const employeeId = request.user.id

  const removeFinalDestinationUseCase = makeRemoveFinalDestinationUseCase()
  await removeFinalDestinationUseCase.execute({ id, employeeId })

  return { message: 'Destino final removido com sucesso' }
}

import { makeRemoveAppointmentUseCase } from '@/use-cases/appointment/remove-appointment/remove-appointment.factory'
import type { FastifyRequest } from 'fastify'
import { removeAppointmentSchema } from './remove-appointment.schema'

export async function removeAppointmentController(request: FastifyRequest) {
  const { id } = removeAppointmentSchema.parse(request.params)
  const employeeId = request.user.id

  const useCase = makeRemoveAppointmentUseCase()
  await useCase.execute({ id }, employeeId)

  return { message: 'Consulta removida com sucesso' }
}

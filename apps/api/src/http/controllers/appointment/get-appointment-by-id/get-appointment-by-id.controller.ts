import { makeGetAppointmentByIdUseCase } from '@/use-cases/appointment/get-appointment-by-id/get-appointment-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getAppointmentByIdSchema } from './get-appointment-by-id.schema'

export async function getAppointmentByIdController(request: FastifyRequest) {
  const { id } = getAppointmentByIdSchema.parse(request.params)

  const useCase = makeGetAppointmentByIdUseCase()
  return await useCase.execute({ id })
}

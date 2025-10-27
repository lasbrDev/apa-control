import { makeGetAppointmentTypeByIdUseCase } from '@/use-cases/appointment-type/get-appointment-type-by-id/get-appointment-type-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getAppointmentTypeByIdSchema } from './get-appointment-type-by-id.schema'

export async function getAppointmentTypeByIdController(request: FastifyRequest) {
  const { id } = getAppointmentTypeByIdSchema.parse(request.params)

  const getAppointmentTypeByIdUseCase = makeGetAppointmentTypeByIdUseCase()
  const result = await getAppointmentTypeByIdUseCase.execute({ id })

  return result
}

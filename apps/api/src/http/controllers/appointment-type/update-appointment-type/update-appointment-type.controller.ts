import { makeUpdateAppointmentTypeUseCase } from '@/use-cases/appointment-type/update-appointment-type/update-appointment-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAppointmentTypeSchema } from './update-appointment-type.schema'

export async function updateAppointmentTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateAppointmentTypeSchema.parse(request.body)

  const updateAppointmentTypeUseCase = makeUpdateAppointmentTypeUseCase()
  await updateAppointmentTypeUseCase.execute(data)

  return reply.status(204).send()
}

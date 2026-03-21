import { makeUpdateAppointmentUseCase } from '@/use-cases/appointment/update-appointment/update-appointment.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAppointmentSchema } from './update-appointment.schema'

export async function updateAppointmentController(request: FastifyRequest, reply: FastifyReply) {
  const body = updateAppointmentSchema.parse(request.body)
  const employeeId = request.user.id

  const useCase = makeUpdateAppointmentUseCase()
  await useCase.execute(body, employeeId)

  return reply.status(204).send()
}

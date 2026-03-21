import { makeCreateAppointmentUseCase } from '@/use-cases/appointment/create-appointment/create-appointment.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAppointmentSchema } from './create-appointment.schema'

export async function createAppointmentController(request: FastifyRequest, reply: FastifyReply) {
  const body = createAppointmentSchema.parse(request.body)
  const employeeId = request.user.id

  const useCase = makeCreateAppointmentUseCase()
  const id = await useCase.execute(body, employeeId)

  return reply.status(201).send({ id })
}

import { makeConfirmAppointmentsUseCase } from '@/use-cases/appointment/confirm-appointments/confirm-appointments.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { confirmAppointmentsSchema } from './confirm-appointments.schema'

export async function confirmAppointmentsController(request: FastifyRequest, reply: FastifyReply) {
  const data = confirmAppointmentsSchema.parse(request.body)
  const employeeId = request.user.id
  const useCase = makeConfirmAppointmentsUseCase()
  await useCase.execute(data, employeeId)
  reply.status(204).send()
}

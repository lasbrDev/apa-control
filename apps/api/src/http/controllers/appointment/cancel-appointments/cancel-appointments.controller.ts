import { makeCancelAppointmentsUseCase } from '@/use-cases/appointment/cancel-appointments/cancel-appointments.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { cancelAppointmentsSchema } from './cancel-appointments.schema'

export async function cancelAppointmentsController(request: FastifyRequest, reply: FastifyReply) {
  const data = cancelAppointmentsSchema.parse(request.body)
  const employeeId = request.user.id
  const useCase = makeCancelAppointmentsUseCase()
  await useCase.execute(data, employeeId)
  reply.status(204).send()
}

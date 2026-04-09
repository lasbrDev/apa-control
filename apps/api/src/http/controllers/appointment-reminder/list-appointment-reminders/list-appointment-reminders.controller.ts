import { makeListAppointmentRemindersUseCase } from '@/use-cases/appointment-reminder/list-appointment-reminders/list-appointment-reminders.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listAppointmentRemindersSchema } from './list-appointment-reminders.schema'

export async function listAppointmentRemindersController(request: FastifyRequest, reply: FastifyReply) {
  const data = listAppointmentRemindersSchema.parse(request.query)
  const useCase = makeListAppointmentRemindersUseCase()
  const [count, items] = await useCase.execute({ ...data, employeeId: request.user.id })

  reply.header('X-Total-Count', count)
  return items
}

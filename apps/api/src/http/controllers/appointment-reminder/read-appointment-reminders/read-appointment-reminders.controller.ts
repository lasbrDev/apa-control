import { makeReadAppointmentRemindersUseCase } from '@/use-cases/appointment-reminder/read-appointment-reminders/read-appointment-reminders.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { readAppointmentRemindersSchema } from './read-appointment-reminders.schema'

export async function readAppointmentRemindersController(request: FastifyRequest, reply: FastifyReply) {
  const { reminderIds } = readAppointmentRemindersSchema.parse(request.body)
  const useCase = makeReadAppointmentRemindersUseCase()
  await useCase.execute(request.user.id, reminderIds)
  return reply.status(204).send()
}

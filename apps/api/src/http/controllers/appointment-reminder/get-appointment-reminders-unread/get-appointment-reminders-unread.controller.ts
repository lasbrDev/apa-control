import { makeGetAppointmentRemindersUnreadUseCase } from '@/use-cases/appointment-reminder/get-appointment-reminders-unread/get-appointment-reminders-unread.factory'
import type { FastifyRequest } from 'fastify'

export async function getAppointmentRemindersUnreadController(request: FastifyRequest) {
  const useCase = makeGetAppointmentRemindersUnreadUseCase()
  return await useCase.execute(request.user.id)
}

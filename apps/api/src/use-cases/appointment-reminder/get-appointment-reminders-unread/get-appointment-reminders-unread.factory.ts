import { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import { GetAppointmentRemindersUnreadUseCase } from './get-appointment-reminders-unread'

export function makeGetAppointmentRemindersUnreadUseCase() {
  return new GetAppointmentRemindersUnreadUseCase(new AppointmentReminderRepository())
}

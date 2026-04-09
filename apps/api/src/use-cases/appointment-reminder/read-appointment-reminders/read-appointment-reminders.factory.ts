import { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import { ReadAppointmentRemindersUseCase } from './read-appointment-reminders'

export function makeReadAppointmentRemindersUseCase() {
  return new ReadAppointmentRemindersUseCase(new AppointmentReminderRepository())
}

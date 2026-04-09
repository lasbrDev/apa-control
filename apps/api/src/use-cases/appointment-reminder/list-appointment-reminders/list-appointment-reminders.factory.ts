import { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import { ListAppointmentRemindersUseCase } from './list-appointment-reminders'

export function makeListAppointmentRemindersUseCase() {
  return new ListAppointmentRemindersUseCase(new AppointmentReminderRepository())
}

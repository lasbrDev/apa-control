import type { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import type { AppointmentReminderWithDetails, ListAppointmentRemindersData } from './list-appointment-reminders.dto'

export class ListAppointmentRemindersUseCase {
  constructor(private appointmentReminderRepository: AppointmentReminderRepository) {}

  async execute(data: ListAppointmentRemindersData): Promise<[number, AppointmentReminderWithDetails[]]> {
    await this.appointmentReminderRepository.purgeInvalidReminders()
    return await this.appointmentReminderRepository.listByEmployee(data)
  }
}

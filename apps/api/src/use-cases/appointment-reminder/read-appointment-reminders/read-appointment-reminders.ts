import type { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'

export class ReadAppointmentRemindersUseCase {
  constructor(private appointmentReminderRepository: AppointmentReminderRepository) {}

  async execute(employeeId: number, reminderIds: number[]): Promise<void> {
    await this.appointmentReminderRepository.markAsRead(employeeId, reminderIds)
  }
}

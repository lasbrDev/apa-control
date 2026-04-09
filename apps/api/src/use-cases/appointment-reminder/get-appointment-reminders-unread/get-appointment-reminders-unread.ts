import type { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'

export class GetAppointmentRemindersUnreadUseCase {
  constructor(private appointmentReminderRepository: AppointmentReminderRepository) {}

  async execute(employeeId: number): Promise<number> {
    await this.appointmentReminderRepository.purgeInvalidReminders()
    return await this.appointmentReminderRepository.countUnreadByEmployee(employeeId)
  }
}

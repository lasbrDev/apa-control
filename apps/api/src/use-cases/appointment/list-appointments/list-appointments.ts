import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { AppointmentWithDetails, ListAppointmentsData } from './list-appointments.dto'

export class ListAppointmentsUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(data: ListAppointmentsData): Promise<[number, AppointmentWithDetails[]]> {
    return await this.appointmentRepository.list(data)
  }
}

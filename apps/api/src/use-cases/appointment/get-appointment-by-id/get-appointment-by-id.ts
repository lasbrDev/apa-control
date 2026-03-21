import type { AppointmentRepository } from '@/repositories/appointment.repository'
import type { AppointmentWithDetails } from '../list-appointments/list-appointments.dto'
import type { GetAppointmentByIdData } from './get-appointment-by-id.dto'

export class GetAppointmentByIdUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(data: GetAppointmentByIdData): Promise<AppointmentWithDetails> {
    return await this.appointmentRepository.findByIdOrThrow(data.id)
  }
}

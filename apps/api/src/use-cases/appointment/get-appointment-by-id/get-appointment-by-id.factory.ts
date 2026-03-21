import { AppointmentRepository } from '@/repositories/appointment.repository'
import { GetAppointmentByIdUseCase } from './get-appointment-by-id'

export function makeGetAppointmentByIdUseCase() {
  return new GetAppointmentByIdUseCase(new AppointmentRepository())
}

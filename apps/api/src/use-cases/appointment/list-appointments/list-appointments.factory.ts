import { AppointmentRepository } from '@/repositories/appointment.repository'
import { ListAppointmentsUseCase } from './list-appointments'

export function makeListAppointmentsUseCase() {
  return new ListAppointmentsUseCase(new AppointmentRepository())
}

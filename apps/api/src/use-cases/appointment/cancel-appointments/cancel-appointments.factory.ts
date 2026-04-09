import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { CancelAppointmentsUseCase } from './cancel-appointments'

export function makeCancelAppointmentsUseCase() {
  return new CancelAppointmentsUseCase(
    new AppointmentRepository(),
    new AppointmentReminderRepository(),
    new AppointmentTypeRepository(),
    new AnimalHistoryRepository(),
  )
}

import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AppointmentReminderRepository } from '@/repositories/appointment-reminder.repository'
import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { AppointmentRepository } from '@/repositories/appointment.repository'
import { ConfirmAppointmentsUseCase } from './confirm-appointments'

export function makeConfirmAppointmentsUseCase() {
  return new ConfirmAppointmentsUseCase(
    new AppointmentRepository(),
    new AppointmentReminderRepository(),
    new AppointmentTypeRepository(),
    new AnimalHistoryRepository(),
  )
}

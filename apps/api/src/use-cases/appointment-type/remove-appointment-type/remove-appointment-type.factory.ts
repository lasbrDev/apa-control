import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { RemoveAppointmentTypeUseCase } from '@/use-cases/appointment-type/remove-appointment-type/remove-appointment-type'

export function makeRemoveAppointmentTypeUseCase() {
  const appointmentTypeRepository = new AppointmentTypeRepository()
  const removeAppointmentTypeUseCase = new RemoveAppointmentTypeUseCase(appointmentTypeRepository)

  return removeAppointmentTypeUseCase
}

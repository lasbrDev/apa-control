import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { UpdateAppointmentTypeUseCase } from '@/use-cases/appointment-type/update-appointment-type/update-appointment-type'

export function makeUpdateAppointmentTypeUseCase() {
  const appointmentTypeRepository = new AppointmentTypeRepository()
  const updateAppointmentTypeUseCase = new UpdateAppointmentTypeUseCase(appointmentTypeRepository)

  return updateAppointmentTypeUseCase
}

import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { CreateAppointmentTypeUseCase } from '@/use-cases/appointment-type/create-appointment-type/create-appointment-type'

export function makeCreateAppointmentTypeUseCase() {
  const appointmentTypeRepository = new AppointmentTypeRepository()
  const createAppointmentTypeUseCase = new CreateAppointmentTypeUseCase(appointmentTypeRepository)

  return createAppointmentTypeUseCase
}

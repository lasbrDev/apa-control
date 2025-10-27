import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { GetAppointmentTypeByIdUseCase } from '@/use-cases/appointment-type/get-appointment-type-by-id/get-appointment-type-by-id'

export function makeGetAppointmentTypeByIdUseCase() {
  const appointmentTypeRepository = new AppointmentTypeRepository()
  const getAppointmentTypeByIdUseCase = new GetAppointmentTypeByIdUseCase(appointmentTypeRepository)

  return getAppointmentTypeByIdUseCase
}

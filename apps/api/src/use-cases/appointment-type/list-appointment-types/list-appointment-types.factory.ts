import { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { ListAppointmentTypesUseCase } from '@/use-cases/appointment-type/list-appointment-types/list-appointment-types'

export function makeListAppointmentTypesUseCase() {
  const appointmentTypeRepository = new AppointmentTypeRepository()
  const listAppointmentTypesUseCase = new ListAppointmentTypesUseCase(appointmentTypeRepository)

  return listAppointmentTypesUseCase
}

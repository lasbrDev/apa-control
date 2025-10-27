import { makeListAppointmentTypesUseCase } from '@/use-cases/appointment-type/list-appointment-types/list-appointment-types.factory'

export async function listAppointmentTypesController() {
  const listAppointmentTypesUseCase = makeListAppointmentTypesUseCase()
  const result = await listAppointmentTypesUseCase.execute()
  return result
}

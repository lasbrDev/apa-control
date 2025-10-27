import type { AppointmentTypeRepository } from '@/repositories'
import type { ListAppointmentTypesDTO } from './list-appointment-types.dto'

export class ListAppointmentTypesUseCase {
  constructor(private appointmentTypeRepository: AppointmentTypeRepository) {}

  async execute(): Promise<ListAppointmentTypesDTO[]> {
    const items = await this.appointmentTypeRepository.list()
    return items
  }
}

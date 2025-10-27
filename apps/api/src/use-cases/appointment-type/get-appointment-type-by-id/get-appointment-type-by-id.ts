import type { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { ApiError } from '@/utils/api-error'
import type { GetAppointmentTypeByIdDTO, GetAppointmentTypeByIdData } from './get-appointment-type-by-id.dto'

export class GetAppointmentTypeByIdUseCase {
  constructor(private appointmentTypeRepository: AppointmentTypeRepository) {}

  async execute(data: GetAppointmentTypeByIdData): Promise<GetAppointmentTypeByIdDTO> {
    const appointmentType = await this.appointmentTypeRepository.findById(data.id)

    if (!appointmentType) {
      throw new ApiError('Nenhum tipo de consulta encontrado.', 404)
    }

    return {
      id: appointmentType.id,
      name: appointmentType.name,
      description: appointmentType.description,
      urgency: appointmentType.urgency,
      active: appointmentType.active,
    }
  }
}

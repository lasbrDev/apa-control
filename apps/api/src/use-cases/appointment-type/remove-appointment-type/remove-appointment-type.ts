import type { DrizzleTransaction } from '@/database/types'
import type { AppointmentTypeRepository } from '@/repositories/appointment-type.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveAppointmentTypeData } from './remove-appointment-type.dto'

export class RemoveAppointmentTypeUseCase {
  constructor(private appointmentTypeRepository: AppointmentTypeRepository) {}

  async execute(data: RemoveAppointmentTypeData, dbTransaction: DrizzleTransaction) {
    const appointmentType = await this.appointmentTypeRepository.findById(data.id)

    if (!appointmentType) {
      throw new ApiError('Nenhum tipo de consulta encontrado.', 404)
    }

    await this.appointmentTypeRepository.remove(appointmentType.id, dbTransaction)
  }
}

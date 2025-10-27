import type { DrizzleTransaction } from '@/database/types'
import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveVeterinaryClinicData } from './remove-veterinary-clinic.dto'

export class RemoveVeterinaryClinicUseCase {
  constructor(private veterinaryClinicRepository: VeterinaryClinicRepository) {}

  async execute(data: RemoveVeterinaryClinicData, dbTransaction: DrizzleTransaction) {
    const veterinaryClinic = await this.veterinaryClinicRepository.findById(data.id)

    if (!veterinaryClinic) {
      throw new ApiError('Nenhuma clínica veterinária encontrada.', 404)
    }

    await this.veterinaryClinicRepository.remove(veterinaryClinic.id, dbTransaction)
  }
}

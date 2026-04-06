import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ApiError } from '@/utils/api-error'
import type { DisableVeterinaryClinicData } from './disable-veterinary-clinic.dto'

export class DisableVeterinaryClinicUseCase {
  constructor(private veterinaryClinicRepository: VeterinaryClinicRepository) {}

  async execute(data: DisableVeterinaryClinicData): Promise<void> {
    const clinic = await this.veterinaryClinicRepository.findById(data.id)

    if (!clinic) {
      throw new ApiError('Clínica veterinária não encontrada.', 404)
    }

    await this.veterinaryClinicRepository.update(data.id, {
      active: !data.disabled,
    })
  }
}

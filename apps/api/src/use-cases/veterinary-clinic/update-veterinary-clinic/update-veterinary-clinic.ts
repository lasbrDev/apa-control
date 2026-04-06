import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateVeterinaryClinicData } from './update-veterinary-clinic.dto'

export class UpdateVeterinaryClinicUseCase {
  constructor(private veterinaryClinicRepository: VeterinaryClinicRepository) {}

  async execute(data: UpdateVeterinaryClinicData): Promise<void> {
    const oldData = await this.veterinaryClinicRepository.findById(data.id)

    if (!oldData) {
      throw new ApiError('Clínica veterinária não encontrada.', 404)
    }

    if (oldData.cnpj !== data.cnpj && (await this.veterinaryClinicRepository.hasExist(data.cnpj))) {
      throw new ApiError('Já existe uma clínica veterinária cadastrada com o CNPJ informado.', 409)
    }

    await this.veterinaryClinicRepository.update(data.id, {
      name: data.name,
      cnpj: data.cnpj,
      phone: data.phone,
      address: data.address,
      responsible: data.responsible,
      specialties: data.specialties,
    })
  }
}

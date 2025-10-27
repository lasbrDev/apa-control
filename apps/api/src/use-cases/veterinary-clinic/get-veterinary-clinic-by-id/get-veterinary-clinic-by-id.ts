import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import { ApiError } from '@/utils/api-error'
import type { GetVeterinaryClinicByIdDTO, GetVeterinaryClinicByIdData } from './get-veterinary-clinic-by-id.dto'

export class GetVeterinaryClinicByIdUseCase {
  constructor(private veterinaryClinicRepository: VeterinaryClinicRepository) {}

  async execute(data: GetVeterinaryClinicByIdData): Promise<GetVeterinaryClinicByIdDTO> {
    const veterinaryClinic = await this.veterinaryClinicRepository.findById(data.id)

    if (!veterinaryClinic) {
      throw new ApiError('Nenhuma clínica veterinária encontrada.', 404)
    }

    return {
      id: veterinaryClinic.id,
      name: veterinaryClinic.name,
      cnpj: veterinaryClinic.cnpj,
      phone: veterinaryClinic.phone,
      address: veterinaryClinic.address,
      responsible: veterinaryClinic.responsible,
      specialties: veterinaryClinic.specialties,
      active: veterinaryClinic.active,
    }
  }
}

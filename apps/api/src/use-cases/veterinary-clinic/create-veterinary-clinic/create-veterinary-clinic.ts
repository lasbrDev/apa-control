import { VeterinaryClinic } from '@/entities'
import type { VeterinaryClinicRepository } from '@/repositories/veterinary-clinic.repository'
import type { CreateVeterinaryClinicDTO, CreateVeterinaryClinicData } from './create-veterinary-clinic.dto'

export class CreateVeterinaryClinicUseCase {
  constructor(private veterinaryClinicRepository: VeterinaryClinicRepository) {}

  async execute(data: CreateVeterinaryClinicData): Promise<CreateVeterinaryClinicDTO> {
    const veterinaryClinic = new VeterinaryClinic({
      name: data.name,
      cnpj: data.cnpj,
      phone: data.phone,
      address: data.address,
      responsible: data.responsible,
      specialties: data.specialties,
      active: data.active,
      registrationDate: new Date(),
    })

    const result = await this.veterinaryClinicRepository.create(veterinaryClinic)

    return { id: result.id }
  }
}

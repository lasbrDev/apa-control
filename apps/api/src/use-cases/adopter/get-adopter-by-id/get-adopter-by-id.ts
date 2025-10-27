import type { AdopterRepository } from '@/repositories/adopter.repository'
import { ApiError } from '@/utils/api-error'
import type { GetAdopterByIdDTO, GetAdopterByIdData } from './get-adopter-by-id.dto'

export class GetAdopterByIdUseCase {
  constructor(private adopterRepository: AdopterRepository) {}

  async execute(data: GetAdopterByIdData): Promise<GetAdopterByIdDTO> {
    const adopter = await this.adopterRepository.findById(data.id)

    if (!adopter) {
      throw new ApiError('Nenhum adotante encontrado.', 404)
    }

    return {
      id: adopter.id!,
      name: adopter.name,
      cpf: adopter.cpf,
      email: adopter.email,
      phone: adopter.phone,
      address: adopter.address,
      familyIncome: Number(adopter.familyIncome),
      animalExperience: adopter.animalExperience,
      approvalStatus: adopter.approvalStatus,
    }
  }
}

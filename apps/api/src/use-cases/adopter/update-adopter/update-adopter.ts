import type { AdopterRepository } from '@/repositories/adopter.repository'
import { ApiError } from '@/utils/api-error'
import Decimal from 'decimal.js'
import type { UpdateAdopterData } from './update-adopter.dto'

export class UpdateAdopterUseCase {
  constructor(private adopterRepository: AdopterRepository) {}

  async execute(data: UpdateAdopterData): Promise<void> {
    const oldData = await this.adopterRepository.findById(data.id)

    if (!oldData) {
      throw new ApiError('Adotante não encontrado.', 404)
    }

    await this.adopterRepository.update(data.id, {
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
      address: data.address,
      familyIncome: new Decimal(data.familyIncome),
      animalExperience: data.animalExperience,
      approvalStatus: data.approvalStatus,
      updatedAt: new Date(),
    })
  }
}

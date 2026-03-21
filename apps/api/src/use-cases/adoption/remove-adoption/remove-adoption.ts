import { db } from '@/database/client'
import { AdoptionStatus } from '@/database/schema/enums/adoption-status'
import { AnimalStatus } from '@/database/schema/enums/animal-status'
import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveAdoptionData } from './remove-adoption.dto'

export class RemoveAdoptionUseCase {
  constructor(
    private adoptionRepository: AdoptionRepository,
    private animalRepository: AnimalRepository,
  ) {}

  async execute(data: RemoveAdoptionData): Promise<void> {
    const existing = await this.adoptionRepository.findById(data.id)
    if (!existing) throw new ApiError('Adoção não encontrada.', 404)

    await db.transaction(async (tx) => {
      await this.adoptionRepository.delete(data.id, tx)

      if (existing.status === AdoptionStatus.COMPLETED) {
        await this.animalRepository.update(existing.animalId, { status: AnimalStatus.AVAILABLE }, tx)
      }
    })
  }
}

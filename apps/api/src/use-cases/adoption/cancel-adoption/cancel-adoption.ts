import { db } from '@/database/client'
import { AdoptionStatus } from '@/database/schema/enums/adoption-status'
import { AnimalStatus } from '@/database/schema/enums/animal-status'
import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import { ApiError } from '@/utils/api-error'
import type { CancelAdoptionData } from './cancel-adoption.dto'

export class CancelAdoptionUseCase {
  constructor(
    private adoptionRepository: AdoptionRepository,
    private animalRepository: AnimalRepository,
  ) {}

  async execute({ id, reason, employeeId }: CancelAdoptionData): Promise<void> {
    const existing = await this.adoptionRepository.findByIdOrThrow(id)

    if (existing.status === AdoptionStatus.COMPLETED) {
      throw new ApiError('Não é possível cancelar uma adoção concluída.', 400)
    }

    await db.transaction(async (tx) => {
      await this.adoptionRepository.update(
        id,
        {
          status: AdoptionStatus.CANCELLED,
          observations: reason,
          employeeId,
        },
        tx,
      )
      await this.animalRepository.update(existing.animalId, { status: AnimalStatus.AVAILABLE }, tx)
    })
  }
}

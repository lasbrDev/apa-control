import { db } from '@/database/client'
import { AdoptionStatus } from '@/database/schema/enums/adoption-status'
import { AnimalStatus } from '@/database/schema/enums/animal-status'
import type { AdoptionRepository } from '@/repositories/adoption.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import { ApiError } from '@/utils/api-error'
import type { ConfirmAdoptionData } from './confirm-adoption.dto'

export class ConfirmAdoptionUseCase {
  constructor(
    private adoptionRepository: AdoptionRepository,
    private animalRepository: AnimalRepository,
  ) {}

  async execute({ id, employeeId }: ConfirmAdoptionData): Promise<void> {
    const existing = await this.adoptionRepository.findByIdOrThrow(id)

    if (existing.status === AdoptionStatus.CANCELLED) {
      throw new ApiError('Não é possível confirmar uma adoção cancelada.', 400)
    }

    await db.transaction(async (tx) => {
      await this.adoptionRepository.update(
        id,
        {
          status: AdoptionStatus.COMPLETED,
          termSigned: true,
          employeeId,
        },
        tx,
      )
      await this.animalRepository.update(existing.animalId, { status: AnimalStatus.ADOPTED }, tx)
    })
  }
}

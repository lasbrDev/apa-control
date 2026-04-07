import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { RescueRepository } from '@/repositories/rescue.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveRescueData } from './remove-rescue.dto'

export class RemoveRescueUseCase {
  constructor(
    private rescueRepository: RescueRepository,
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: RemoveRescueData): Promise<void> {
    const rescue = await this.rescueRepository.findById(data.id)

    if (!rescue) {
      throw new ApiError('Resgate não encontrado.', 404)
    }

    await db.transaction(async (tx) => {
      await this.rescueRepository.delete(data.id, tx)
      await this.animalRepository.update(rescue.animalId, { status: 'pendente', rescueAt: null }, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: rescue.animalId,
          rescueId: rescue.id,
          employeeId: data.employeeId,
          type: AnimalHistoryType.RESCUE,
          action: 'rescue.deleted',
          description: 'Resgate removido',
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}

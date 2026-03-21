import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { ApiError } from '@/utils/api-error'

export class RemoveOccurrenceUseCase {
  constructor(
    private occurrenceRepository: OccurrenceRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(id: number, employeeId: number): Promise<void> {
    const existing = await this.occurrenceRepository.findById(id)
    if (!existing) throw new ApiError('Ocorrência não encontrada.', 404)

    await db.transaction(async (tx) => {
      await this.occurrenceRepository.delete(id, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: existing.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.OCCURRENCE,
          action: 'occurrence.deleted',
          description: 'Ocorrência removida',
          oldValue: JSON.stringify({
            occurrenceTypeId: existing.occurrenceTypeId,
            occurrenceDate: existing.occurrenceDate,
            description: existing.description,
            observations: existing.observations ?? null,
          }),
          newValue: '',
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}

import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'

import type { AnimalHistoryWithDetails, GetAnimalHistoryByIdData } from './get-animal-history-by-id.dto'

export class GetAnimalHistoryByIdUseCase {
  constructor(private animalHistoryRepository: AnimalHistoryRepository) {}

  async execute(data: GetAnimalHistoryByIdData): Promise<AnimalHistoryWithDetails[]> {
    const { id, types, startDate, endDate, employeeId } = data
    return await this.animalHistoryRepository.listByAnimalId(id, {
      types,
      startDate,
      endDate,
      employeeId,
    })
  }
}

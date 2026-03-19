import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'

import { GetAnimalHistoryByIdUseCase } from './get-animal-history-by-id'

export function makeGetAnimalHistoryByIdUseCase() {
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new GetAnimalHistoryByIdUseCase(animalHistoryRepository)
}

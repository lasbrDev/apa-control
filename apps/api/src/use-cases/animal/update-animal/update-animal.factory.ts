import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { UpdateAnimalUseCase } from './update-animal'

export function makeUpdateAnimalUseCase() {
  const animalRepository = new AnimalRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new UpdateAnimalUseCase(animalRepository, animalHistoryRepository)
}

import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { CreateAnimalUseCase } from './create-animal'

export function makeCreateAnimalUseCase() {
  const animalRepository = new AnimalRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new CreateAnimalUseCase(animalRepository, animalHistoryRepository)
}

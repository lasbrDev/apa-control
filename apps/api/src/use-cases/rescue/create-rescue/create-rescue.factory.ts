import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { RescueRepository } from '@/repositories/rescue.repository'
import { CreateRescueUseCase } from './create-rescue'

export function makeCreateRescueUseCase() {
  const rescueRepository = new RescueRepository()
  const animalRepository = new AnimalRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new CreateRescueUseCase(rescueRepository, animalRepository, animalHistoryRepository)
}

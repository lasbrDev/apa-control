import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { RescueRepository } from '@/repositories/rescue.repository'
import { RemoveRescueUseCase } from './remove-rescue'

export function makeRemoveRescueUseCase() {
  const rescueRepository = new RescueRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new RemoveRescueUseCase(rescueRepository, animalHistoryRepository)
}

import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { RescueRepository } from '@/repositories/rescue.repository'
import { UpdateRescueUseCase } from './update-rescue'

export function makeUpdateRescueUseCase() {
  const rescueRepository = new RescueRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new UpdateRescueUseCase(rescueRepository, animalHistoryRepository)
}

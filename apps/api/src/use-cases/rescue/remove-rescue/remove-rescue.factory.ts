import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { RescueRepository } from '@/repositories/rescue.repository'
import { RemoveRescueUseCase } from './remove-rescue'

export function makeRemoveRescueUseCase() {
  const rescueRepository = new RescueRepository()
  const animalRepository = new AnimalRepository()
  const finalDestinationRepository = new FinalDestinationRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new RemoveRescueUseCase(
    rescueRepository,
    animalRepository,
    finalDestinationRepository,
    animalHistoryRepository,
  )
}

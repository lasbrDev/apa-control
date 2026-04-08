import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { RescueRepository } from '@/repositories/rescue.repository'
import { RemoveFinalDestinationUseCase } from './remove-final-destination'

export function makeRemoveFinalDestinationUseCase() {
  const finalDestinationRepository = new FinalDestinationRepository()
  const animalRepository = new AnimalRepository()
  const rescueRepository = new RescueRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new RemoveFinalDestinationUseCase(
    finalDestinationRepository,
    animalRepository,
    rescueRepository,
    animalHistoryRepository,
  )
}

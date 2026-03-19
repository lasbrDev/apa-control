import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { RemoveFinalDestinationUseCase } from './remove-final-destination'

export function makeRemoveFinalDestinationUseCase() {
  const finalDestinationRepository = new FinalDestinationRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()
  return new RemoveFinalDestinationUseCase(finalDestinationRepository, animalHistoryRepository)
}

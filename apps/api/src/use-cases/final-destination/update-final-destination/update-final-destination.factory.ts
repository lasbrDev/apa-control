import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { UpdateFinalDestinationUseCase } from './update-final-destination'

export function makeUpdateFinalDestinationUseCase() {
  const finalDestinationRepository = new FinalDestinationRepository()
  const finalDestinationTypeRepository = new FinalDestinationTypeRepository()
  const animalRepository = new AnimalRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()

  return new UpdateFinalDestinationUseCase(
    finalDestinationRepository,
    finalDestinationTypeRepository,
    animalRepository,
    animalHistoryRepository,
  )
}

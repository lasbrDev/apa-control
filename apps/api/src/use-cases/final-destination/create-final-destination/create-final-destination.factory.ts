import { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import { AnimalRepository } from '@/repositories/animal.repository'
import { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { CreateFinalDestinationUseCase } from './create-final-destination'

export function makeCreateFinalDestinationUseCase() {
  const finalDestinationRepository = new FinalDestinationRepository()
  const finalDestinationTypeRepository = new FinalDestinationTypeRepository()
  const animalRepository = new AnimalRepository()
  const animalHistoryRepository = new AnimalHistoryRepository()

  return new CreateFinalDestinationUseCase(
    finalDestinationRepository,
    finalDestinationTypeRepository,
    animalRepository,
    animalHistoryRepository,
  )
}

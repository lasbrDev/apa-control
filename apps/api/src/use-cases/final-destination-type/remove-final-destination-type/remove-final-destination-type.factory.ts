import { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { RemoveFinalDestinationTypeUseCase } from '@/use-cases/final-destination-type/remove-final-destination-type/remove-final-destination-type'

export function makeRemoveFinalDestinationTypeUseCase() {
  const finalDestinationTypeRepository = new FinalDestinationTypeRepository()
  const removeFinalDestinationTypeUseCase = new RemoveFinalDestinationTypeUseCase(finalDestinationTypeRepository)

  return removeFinalDestinationTypeUseCase
}

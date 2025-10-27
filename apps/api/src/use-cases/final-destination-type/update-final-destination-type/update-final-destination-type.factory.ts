import { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { UpdateFinalDestinationTypeUseCase } from '@/use-cases/final-destination-type/update-final-destination-type/update-final-destination-type'

export function makeUpdateFinalDestinationTypeUseCase() {
  const finalDestinationTypeRepository = new FinalDestinationTypeRepository()
  const updateFinalDestinationTypeUseCase = new UpdateFinalDestinationTypeUseCase(finalDestinationTypeRepository)

  return updateFinalDestinationTypeUseCase
}

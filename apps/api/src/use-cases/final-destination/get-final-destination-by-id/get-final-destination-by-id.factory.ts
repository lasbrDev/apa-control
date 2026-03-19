import { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { GetFinalDestinationByIdUseCase } from './get-final-destination-by-id'

export function makeGetFinalDestinationByIdUseCase() {
  const finalDestinationRepository = new FinalDestinationRepository()
  return new GetFinalDestinationByIdUseCase(finalDestinationRepository)
}

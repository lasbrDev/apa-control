import { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { ListFinalDestinationsUseCase } from './list-final-destinations'

export function makeListFinalDestinationsUseCase() {
  const finalDestinationRepository = new FinalDestinationRepository()
  return new ListFinalDestinationsUseCase(finalDestinationRepository)
}

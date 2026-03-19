import type { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import type { FinalDestinationWithDetails, ListFinalDestinationsData } from './list-final-destinations.dto'

export class ListFinalDestinationsUseCase {
  constructor(private finalDestinationRepository: FinalDestinationRepository) {}

  async execute(data: ListFinalDestinationsData): Promise<[number, FinalDestinationWithDetails[]]> {
    return await this.finalDestinationRepository.list(data)
  }
}

import type { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import type { FinalDestinationById, GetFinalDestinationByIdData } from './get-final-destination-by-id.dto'

export class GetFinalDestinationByIdUseCase {
  constructor(private finalDestinationRepository: FinalDestinationRepository) {}

  async execute(data: GetFinalDestinationByIdData): Promise<FinalDestinationById> {
    return await this.finalDestinationRepository.findByIdOrThrow(data.id)
  }
}

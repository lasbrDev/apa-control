import type { FinalDestinationTypeRepository } from '@/repositories'
import type { ListFinalDestinationTypesDTO } from './list-final-destination-types.dto'

export class ListFinalDestinationTypesUseCase {
  constructor(private finalDestinationTypeRepository: FinalDestinationTypeRepository) {}

  async execute(): Promise<ListFinalDestinationTypesDTO[]> {
    const items = await this.finalDestinationTypeRepository.list()
    return items
  }
}

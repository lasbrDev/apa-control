import { FinalDestinationType } from '@/entities'
import type { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import type { CreateFinalDestinationTypeDTO, CreateFinalDestinationTypeData } from './create-final-destination-type.dto'

export class CreateFinalDestinationTypeUseCase {
  constructor(private finalDestinationTypeRepository: FinalDestinationTypeRepository) {}

  async execute(data: CreateFinalDestinationTypeData): Promise<CreateFinalDestinationTypeDTO> {
    const finalDestinationType = new FinalDestinationType({
      name: data.name,
      description: data.description,
      requiresApproval: data.requiresApproval,
      active: data.active,
      createdAt: new Date(),
    })

    const result = await this.finalDestinationTypeRepository.create(finalDestinationType)

    return { id: result.id }
  }
}

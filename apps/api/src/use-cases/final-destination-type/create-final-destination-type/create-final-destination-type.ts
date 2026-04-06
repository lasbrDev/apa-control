import { FinalDestinationType } from '@/entities'
import type { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { ApiError } from '@/utils/api-error'
import type { CreateFinalDestinationTypeDTO, CreateFinalDestinationTypeData } from './create-final-destination-type.dto'

export class CreateFinalDestinationTypeUseCase {
  constructor(private finalDestinationTypeRepository: FinalDestinationTypeRepository) {}

  async execute(data: CreateFinalDestinationTypeData): Promise<CreateFinalDestinationTypeDTO> {
    if (await this.finalDestinationTypeRepository.hasName(data.name)) {
      throw new ApiError('Já existe um tipo de destino final cadastrado com o nome informado.', 409)
    }

    const finalDestinationType = new FinalDestinationType({
      name: data.name,
      description: data.description,
      active: data.active,
      createdAt: new Date(),
    })

    const result = await this.finalDestinationTypeRepository.create(finalDestinationType)

    return { id: result.id }
  }
}

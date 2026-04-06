import type { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateFinalDestinationTypeData } from './update-final-destination-type.dto'

export class UpdateFinalDestinationTypeUseCase {
  constructor(private finalDestinationTypeRepository: FinalDestinationTypeRepository) {}

  async execute(data: UpdateFinalDestinationTypeData): Promise<void> {
    const oldData = await this.finalDestinationTypeRepository.findById(data.id)

    if (!oldData) {
      throw new ApiError('Tipo de destino final não encontrado.', 404)
    }

    if (oldData.name !== data.name && (await this.finalDestinationTypeRepository.hasName(data.name))) {
      throw new ApiError('Já existe um tipo de destino final cadastrado com o nome informado.', 409)
    }

    await this.finalDestinationTypeRepository.update(data.id, {
      name: data.name,
      description: data.description,
      active: data.active,
    })
  }
}

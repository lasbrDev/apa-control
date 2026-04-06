import type { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { ApiError } from '@/utils/api-error'
import type {
  GetFinalDestinationTypeByIdDTO,
  GetFinalDestinationTypeByIdData,
} from './get-final-destination-type-by-id.dto'

export class GetFinalDestinationTypeByIdUseCase {
  constructor(private finalDestinationTypeRepository: FinalDestinationTypeRepository) {}

  async execute(data: GetFinalDestinationTypeByIdData): Promise<GetFinalDestinationTypeByIdDTO> {
    const finalDestinationType = await this.finalDestinationTypeRepository.findById(data.id)

    if (!finalDestinationType) {
      throw new ApiError('Nenhum tipo de destino final encontrado.', 404)
    }

    return {
      id: finalDestinationType.id,
      name: finalDestinationType.name,
      description: finalDestinationType.description,
      active: finalDestinationType.active,
    }
  }
}

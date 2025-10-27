import type { DrizzleTransaction } from '@/database/types'
import type { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import { ApiError } from '@/utils/api-error'
import type { RemoveFinalDestinationTypeData } from './remove-final-destination-type.dto'

export class RemoveFinalDestinationTypeUseCase {
  constructor(private finalDestinationTypeRepository: FinalDestinationTypeRepository) {}

  async execute(data: RemoveFinalDestinationTypeData, dbTransaction: DrizzleTransaction) {
    const finalDestinationType = await this.finalDestinationTypeRepository.findById(data.id)

    if (!finalDestinationType) {
      throw new ApiError('Nenhum tipo de destino final encontrado.', 404)
    }

    await this.finalDestinationTypeRepository.remove(finalDestinationType.id, dbTransaction)
  }
}

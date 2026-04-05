import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import type { RemoveFinalDestinationData } from './remove-final-destination.dto'

export class RemoveFinalDestinationUseCase {
  constructor(
    private finalDestinationRepository: FinalDestinationRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: RemoveFinalDestinationData): Promise<void> {
    const finalDestination = await this.finalDestinationRepository.findById(data.id)
    if (!finalDestination) throw new ApiError('Destino final não encontrado.', 404)

    const oldValues = {
      animalId: finalDestination.animalId,
      destinationTypeId: finalDestination.destinationTypeId,
      destinationDate: finalDestination.destinationDate,
      reason: finalDestination.reason,
      observations: finalDestination.observations ?? null,
      proof: finalDestination.proof ?? null,
    }

    await db.transaction(async (tx) => {
      await this.finalDestinationRepository.delete(data.id, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: finalDestination.animalId,
          rescueId: null,
          employeeId: data.employeeId,
          type: AnimalHistoryType.FINAL_DESTINATION,
          action: 'final-destination.deleted',
          description: 'Destino final removido',
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )
    })

    await removeUploadFile(finalDestination.proof)
  }
}

import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import type { RescueRepository } from '@/repositories/rescue.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import type { RemoveFinalDestinationData } from './remove-final-destination.dto'

export class RemoveFinalDestinationUseCase {
  constructor(
    private finalDestinationRepository: FinalDestinationRepository,
    private animalRepository: AnimalRepository,
    private rescueRepository: RescueRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: RemoveFinalDestinationData): Promise<void> {
    const finalDestination = await this.finalDestinationRepository.findById(data.id)
    if (!finalDestination) throw new ApiError('Destino final não encontrado.', 404)

    const hasRescue = await this.rescueRepository.findExistingRescue(finalDestination.animalId)

    await db.transaction(async (tx) => {
      await this.finalDestinationRepository.delete(data.id, tx)
      await this.animalRepository.update(
        finalDestination.animalId,
        hasRescue ? { status: 'ativo' } : { status: 'pendente', rescueAt: null },
        tx,
      )

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

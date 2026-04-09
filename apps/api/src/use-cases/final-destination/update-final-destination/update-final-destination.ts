import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { FinalDestinationTypeRepository } from '@/repositories/final-destination-type.repository'
import type { FinalDestinationRepository } from '@/repositories/final-destination.repository'
import { ApiError } from '@/utils/api-error'
import { removeUploadFile } from '@/utils/files/remove-upload-file'
import type { UpdateFinalDestinationData } from './update-final-destination.dto'

export class UpdateFinalDestinationUseCase {
  constructor(
    private finalDestinationRepository: FinalDestinationRepository,
    private finalDestinationTypeRepository: FinalDestinationTypeRepository,
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: UpdateFinalDestinationData): Promise<void> {
    const existing = await this.finalDestinationRepository.findById(data.id)
    if (!existing) throw new ApiError('Destino final não encontrado.', 404)

    const [animal, destinationType, duplicateByAnimal] = await Promise.all([
      this.animalRepository.findById(data.animalId),
      this.finalDestinationTypeRepository.findById(data.destinationTypeId),
      this.finalDestinationRepository.findByAnimalIdExceptId(data.animalId, data.id),
    ])

    if (!animal) throw new ApiError('Animal não encontrado.', 404)
    if (!destinationType) throw new ApiError('Tipo de destino final não encontrado.', 404)
    if (duplicateByAnimal) throw new ApiError('Este animal já possui destino final registrado.', 409)

    const changedData = Object.entries(data).reduce(
      (acc, [key, value]) => {
        const shouldIgnoreKey = key === 'id' || key === 'employeeId'
        if (shouldIgnoreKey) return acc

        const oldValue = (existing as Record<string, unknown>)[key] ?? null
        const newValue = typeof value !== 'undefined' ? value : oldValue

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          return { ...acc, [key]: newValue }
        }

        return acc
      },
      {} as Record<string, unknown>,
    )

    const oldValues = Object.keys(changedData).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (existing as Record<string, unknown>)[key] ?? null
      return acc
    }, {})

    const newValues = Object.keys(changedData).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = changedData[key]
      return acc
    }, {})

    if (Object.keys(changedData).length === 0) return

    await db.transaction(async (tx) => {
      await this.finalDestinationRepository.update(
        data.id,
        {
          animalId: data.animalId,
          destinationTypeId: data.destinationTypeId,
          destinationDate: data.destinationDate,
          reason: data.reason,
          observations: data.observations ?? null,
          proof: data.proof ?? null,
        },
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId: data.employeeId,
          type: AnimalHistoryType.FINAL_DESTINATION,
          action: 'final-destination.updated',
          description: 'Destino final atualizado',
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })

    if (existing.proof && existing.proof !== (data.proof ?? null)) {
      await removeUploadFile(existing.proof)
    }
  }
}

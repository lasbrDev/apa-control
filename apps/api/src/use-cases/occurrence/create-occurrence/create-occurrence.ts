import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory, Occurrence } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import type { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { ApiError } from '@/utils/api-error'

type CreateOccurrenceData = {
  animalId: number
  occurrenceTypeId: number
  occurrenceDate: string
  description: string
  observations?: string | null
}

export class CreateOccurrenceUseCase {
  constructor(
    private occurrenceRepository: OccurrenceRepository,
    private occurrenceTypeRepository: OccurrenceTypeRepository,
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: CreateOccurrenceData, employeeId: number) {
    const [animal, type] = await Promise.all([
      this.animalRepository.findById(data.animalId),
      this.occurrenceTypeRepository.findById(data.occurrenceTypeId),
    ])
    if (!animal) throw new ApiError('Animal não encontrado.', 404)
    if (!type) throw new ApiError('Tipo de ocorrência não encontrado.', 404)
    if (!type.active) throw new ApiError('Tipo de ocorrência inativo.', 409)

    const occurrenceDate = new Date(data.occurrenceDate)
    if (Number.isNaN(occurrenceDate.getTime())) throw new ApiError('Data/hora da ocorrência inválida.', 400)

    return db.transaction(async (tx) => {
      const [result] = await this.occurrenceRepository.create(
        new Occurrence({
          animalId: data.animalId,
          occurrenceTypeId: data.occurrenceTypeId,
          employeeId,
          occurrenceDate,
          description: data.description.trim(),
          observations: data.observations?.trim() || null,
          createdAt: new Date(),
          updatedAt: null,
        }),
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.OCCURRENCE,
          action: 'occurrence.created',
          description: 'Ocorrência registrada',
          oldValue: null,
          newValue: null,
          createdAt: new Date(),
        }),
        tx,
      )

      return result!.id
    })
  }
}

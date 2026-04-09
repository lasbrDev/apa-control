import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import type { OccurrenceTypeRepository } from '@/repositories/occurrence-type.repository'
import type { OccurrenceRepository } from '@/repositories/occurrence.repository'
import { ApiError } from '@/utils/api-error'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { parseISO } from 'date-fns'

type UpdateOccurrenceData = {
  id: number
  animalId: number
  occurrenceTypeId: number
  occurrenceDate: string
  description: string
  observations?: string | null
}

export class UpdateOccurrenceUseCase {
  constructor(
    private occurrenceRepository: OccurrenceRepository,
    private occurrenceTypeRepository: OccurrenceTypeRepository,
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: UpdateOccurrenceData, employeeId: number) {
    const existing = await this.occurrenceRepository.findById(data.id)
    if (!existing) throw new ApiError('Ocorrência não encontrada.', 404)

    const [animal, type] = await Promise.all([
      this.animalRepository.findById(data.animalId),
      this.occurrenceTypeRepository.findById(data.occurrenceTypeId),
    ])
    if (!animal) throw new ApiError('Animal não encontrado.', 404)
    if (!type) throw new ApiError('Tipo de ocorrência não encontrado.', 404)
    if (!type.active) throw new ApiError('Tipo de ocorrência inativo.', 409)

    const occurrenceDate = parseISO(data.occurrenceDate, { in: tz(timeZoneName.SP) })
    if (Number.isNaN(occurrenceDate.getTime())) throw new ApiError('Data/hora da ocorrência inválida.', 400)

    const normalizedData = {
      animalId: data.animalId,
      occurrenceTypeId: data.occurrenceTypeId,
      occurrenceDate,
      description: data.description.trim(),
      observations: data.observations?.trim() || null,
    } as const

    const comparableExisting = {
      animalId: existing.animalId,
      occurrenceTypeId: existing.occurrenceTypeId,
      occurrenceDate: existing.occurrenceDate.getTime(),
      description: existing.description,
      observations: existing.observations ?? null,
    } as const

    const comparableNew = {
      animalId: normalizedData.animalId,
      occurrenceTypeId: normalizedData.occurrenceTypeId,
      occurrenceDate: normalizedData.occurrenceDate.getTime(),
      description: normalizedData.description,
      observations: normalizedData.observations,
    } as const

    const changedData = (Object.keys(normalizedData) as (keyof typeof normalizedData)[]).reduce(
      (acc, key) => {
        if (JSON.stringify(comparableExisting[key]) !== JSON.stringify(comparableNew[key])) {
          return { ...acc, [key]: normalizedData[key] }
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
      await this.occurrenceRepository.update(
        data.id,
        {
          animalId: normalizedData.animalId,
          occurrenceTypeId: normalizedData.occurrenceTypeId,
          occurrenceDate,
          description: normalizedData.description,
          observations: normalizedData.observations,
          updatedAt: new Date(),
        },
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.animalId,
          rescueId: null,
          employeeId,
          type: AnimalHistoryType.OCCURRENCE,
          action: 'occurrence.updated',
          description: `Ocorrência de ${type.name} atualizada`,
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}

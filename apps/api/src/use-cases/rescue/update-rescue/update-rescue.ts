import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { RescueRepository } from '@/repositories/rescue.repository'
import { ApiError } from '@/utils/api-error'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { parseISO, startOfDay } from 'date-fns'
import type { UpdateRescueData } from './update-rescue.dto'

export class UpdateRescueUseCase {
  constructor(
    private rescueRepository: RescueRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: UpdateRescueData): Promise<void> {
    const existing = await this.rescueRepository.findById(data.id)

    if (!existing) {
      throw new ApiError('Resgate não encontrado.', 404)
    }

    const rescueDate = startOfDay(parseISO(data.rescueDate, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) })

    const normalizedData = {
      rescueDate,
      locationFound: data.locationFound,
      circumstances: data.circumstances,
      foundConditions: data.foundConditions,
      immediateProcedures: data.immediateProcedures ?? null,
      observations: data.observations ?? null,
    } as const

    const comparableExisting = {
      rescueDate: existing.rescueDate.getTime(),
      locationFound: existing.locationFound,
      circumstances: existing.circumstances,
      foundConditions: existing.foundConditions,
      immediateProcedures: existing.immediateProcedures ?? null,
      observations: existing.observations ?? null,
    } as const

    const comparableNew = {
      rescueDate: normalizedData.rescueDate.getTime(),
      locationFound: normalizedData.locationFound,
      circumstances: normalizedData.circumstances,
      foundConditions: normalizedData.foundConditions,
      immediateProcedures: normalizedData.immediateProcedures,
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
      await this.rescueRepository.update(
        data.id,
        {
          rescueDate: normalizedData.rescueDate,
          locationFound: normalizedData.locationFound,
          circumstances: normalizedData.circumstances,
          foundConditions: normalizedData.foundConditions,
          immediateProcedures: normalizedData.immediateProcedures,
          observations: normalizedData.observations,
        },
        tx,
      )

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: existing.animalId,
          rescueId: existing.id,
          employeeId: data.employeeId,
          type: AnimalHistoryType.RESCUE,
          action: 'rescue.updated',
          description: 'Resgate atualizado',
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}

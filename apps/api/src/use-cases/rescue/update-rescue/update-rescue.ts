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

    await db.transaction(async (tx) => {
      await this.rescueRepository.update(
        data.id,
        {
          rescueDate: startOfDay(parseISO(data.rescueDate, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
          locationFound: data.locationFound,
          circumstances: data.circumstances,
          foundConditions: data.foundConditions,
          immediateProcedures: data.immediateProcedures ?? null,
          observations: data.observations ?? null,
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

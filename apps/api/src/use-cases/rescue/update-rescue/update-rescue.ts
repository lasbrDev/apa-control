import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { RescueRepository } from '@/repositories/rescue.repository'
import { ApiError } from '@/utils/api-error'
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

    const toDateLabel = (value: Date | string) => (value instanceof Date ? value.toISOString().split('T')[0] : value)
    const formatValue = (value: unknown) => (value === null || typeof value === 'undefined' ? '-' : String(value))
    const changed: string[] = []
    const oldValues: Record<string, unknown> = {}
    const newValues: Record<string, unknown> = {}

    const nextRescueDateLabel = toDateLabel(data.rescueDate)
    const prevRescueDateLabel = toDateLabel(existing.rescueDate)
    if (prevRescueDateLabel !== nextRescueDateLabel) {
      changed.push(`Data do resgate: ${formatValue(prevRescueDateLabel)} -> ${formatValue(nextRescueDateLabel)}`)
      oldValues.rescueDate = prevRescueDateLabel
      newValues.rescueDate = nextRescueDateLabel
    }

    if (existing.locationFound !== data.locationFound) {
      changed.push(`Local encontrado: ${formatValue(existing.locationFound)} -> ${formatValue(data.locationFound)}`)
      oldValues.locationFound = existing.locationFound
      newValues.locationFound = data.locationFound
    }
    if (existing.circumstances !== data.circumstances) {
      changed.push(`Circunstâncias: ${formatValue(existing.circumstances)} -> ${formatValue(data.circumstances)}`)
      oldValues.circumstances = existing.circumstances
      newValues.circumstances = data.circumstances
    }
    if (existing.foundConditions !== data.foundConditions) {
      changed.push(
        `Condições em que foi encontrado: ${formatValue(existing.foundConditions)} -> ${formatValue(data.foundConditions)}`,
      )
      oldValues.foundConditions = existing.foundConditions
      newValues.foundConditions = data.foundConditions
    }

    const prevImmediate = existing.immediateProcedures ?? null
    const nextImmediate = data.immediateProcedures ?? null
    if (prevImmediate !== nextImmediate) {
      changed.push(`Procedimentos imediatos: ${formatValue(prevImmediate)} -> ${formatValue(nextImmediate)}`)
      oldValues.immediateProcedures = prevImmediate
      newValues.immediateProcedures = nextImmediate
    }

    const prevObs = existing.observations ?? null
    const nextObs = data.observations ?? null
    if (prevObs !== nextObs) {
      changed.push(`Observações do resgate: ${formatValue(prevObs)} -> ${formatValue(nextObs)}`)
      oldValues.observations = prevObs
      newValues.observations = nextObs
    }

    const description = 'Dados de Resgate atualizados'

    await db.transaction(async (tx) => {
      await this.rescueRepository.update(
        data.id,
        {
          rescueDate: new Date(data.rescueDate),
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
          description,
          oldValue: JSON.stringify(oldValues),
          newValue: JSON.stringify(newValues),
          createdAt: new Date(),
        }),
        tx,
      )
    })
  }
}

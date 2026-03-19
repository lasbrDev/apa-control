import { db } from '@/database/client'
import { AnimalHistoryType } from '@/database/schema/enums/animal-history-type'
import { AnimalHistory } from '@/entities'
import type { Animal } from '@/entities'
import type { AnimalHistoryRepository } from '@/repositories/animal-history.repository'
import type { AnimalRepository } from '@/repositories/animal.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdateAnimalData } from './update-animal.dto'

export class UpdateAnimalUseCase {
  constructor(
    private animalRepository: AnimalRepository,
    private animalHistoryRepository: AnimalHistoryRepository,
  ) {}

  async execute(data: UpdateAnimalData): Promise<void> {
    const oldData = await this.animalRepository.findById(data.id)

    if (!oldData) {
      throw new ApiError('Animal não encontrado.', 404)
    }

    const labelMap: Record<string, string> = {
      name: 'Nome',
      species: 'Espécie',
      breed: 'Raça',
      size: 'Porte',
      sex: 'Sexo',
      age: 'Idade',
      healthCondition: 'Condição de saúde',
      entryDate: 'Data de entrada',
      observations: 'Observações',
      status: 'Status',
    }

    const formatValue = (value: unknown) => (value === null || typeof value === 'undefined' ? '-' : String(value))

    const changedData = Object.entries(data).reduce((acc, [key, value]) => {
      const shouldIgnoreKey = key === 'id' || key === 'employeeId'
      if (shouldIgnoreKey) return acc

      const oldValue = (oldData as Record<string, unknown>)[key] ?? null
      const newValue = typeof value !== 'undefined' ? value : oldValue

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        return { ...acc, [key]: newValue }
      }

      return acc
    }, {}) as Partial<Animal>

    const oldValues = Object.keys(changedData).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (oldData as Record<string, unknown>)[key] ?? null
      return acc
    }, {})

    const newValues = Object.keys(changedData).reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (changedData as Record<string, unknown>)[key]
      return acc
    }, {})

    const changedLabels: string[] =
      Object.keys(changedData).map((key) => {
        const label = labelMap[key] ?? key
        return `${label}: ${formatValue(oldValues[key])} -> ${formatValue(newValues[key])}`
      }) ?? []

    const description = changedLabels.length > 0 ? changedLabels.join(' | ') : 'Nenhuma alteração relevante detectada'

    await db.transaction(async (tx) => {
      await this.animalRepository.update(data.id, changedData, tx)

      await this.animalHistoryRepository.create(
        new AnimalHistory({
          animalId: data.id,
          rescueId: null,
          employeeId: data.employeeId,
          type: AnimalHistoryType.REGISTRATION,
          action: 'animal.updated',
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

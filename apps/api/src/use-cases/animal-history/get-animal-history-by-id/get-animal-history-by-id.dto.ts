import type { AnimalHistoryTypeValue } from '@/database/schema/enums/animal-history-type'

export interface GetAnimalHistoryByIdData {
  id: number
  types?: AnimalHistoryTypeValue[]
  startDate?: string
  endDate?: string
  employeeId?: number
}

export type AnimalHistoryWithDetails = {
  id: number
  animalId: number
  rescueId: number | null
  type: AnimalHistoryTypeValue
  action: string
  description: string
  oldValue: string
  newValue: string
  createdAt: Date
  employeeId: number
  employeeName: string | null
}

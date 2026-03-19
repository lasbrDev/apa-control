import type { AnimalHistoryTypeValue } from '@/database/schema/enums/animal-history-type'

export class AnimalHistory {
  id?: number
  animalId: number
  rescueId?: number | null
  employeeId: number
  type: AnimalHistoryTypeValue
  action: string
  description: string
  oldValue: string
  newValue: string
  createdAt: Date

  constructor(props: Omit<AnimalHistory, 'id'>, id?: number) {
    this.id = id
    this.animalId = props.animalId
    this.rescueId = props.rescueId ?? null
    this.employeeId = props.employeeId
    this.type = props.type
    this.action = props.action
    this.description = props.description
    this.oldValue = props.oldValue
    this.newValue = props.newValue
    this.createdAt = props.createdAt
  }
}

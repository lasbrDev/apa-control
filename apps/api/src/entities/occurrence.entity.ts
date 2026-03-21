export class Occurrence {
  id?: number
  animalId: number
  occurrenceTypeId: number
  employeeId: number
  occurrenceDate: Date
  description: string
  observations?: string | null
  createdAt: Date
  updatedAt?: Date | null

  constructor(props: Omit<Occurrence, 'id'>, id?: number) {
    this.id = id
    this.animalId = props.animalId
    this.occurrenceTypeId = props.occurrenceTypeId
    this.employeeId = props.employeeId
    this.occurrenceDate = props.occurrenceDate
    this.description = props.description
    this.observations = props.observations
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}

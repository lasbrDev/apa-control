export class Adoption {
  id?: number
  animalId: number
  adopterId: number
  employeeId: number
  adoptionDate: string
  adaptationPeriod?: number | null
  status: string
  observations?: string | null
  proof?: string | null
  createdAt: Date
  updatedAt?: Date | null

  constructor(props: Omit<Adoption, 'id'>, id?: number) {
    this.id = id
    this.animalId = props.animalId
    this.adopterId = props.adopterId
    this.employeeId = props.employeeId
    this.adoptionDate = props.adoptionDate
    this.adaptationPeriod = props.adaptationPeriod
    this.status = props.status
    this.observations = props.observations
    this.proof = props.proof
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}

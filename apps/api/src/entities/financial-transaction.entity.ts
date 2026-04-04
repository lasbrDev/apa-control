import type { Decimal } from 'decimal.js'

export class FinancialTransaction {
  id?: number
  transactionTypeId: number
  campaignId?: number | null
  animalId?: number | null
  employeeId: number
  description: string
  value: Decimal
  proof?: string | null
  observations?: string | null
  status: string
  createdAt: Date

  constructor(props: Omit<FinancialTransaction, 'id'>, id?: number) {
    this.id = id
    this.transactionTypeId = props.transactionTypeId
    this.campaignId = props.campaignId
    this.animalId = props.animalId
    this.employeeId = props.employeeId
    this.description = props.description
    this.value = props.value
    this.proof = props.proof
    this.observations = props.observations
    this.status = props.status
    this.createdAt = props.createdAt
  }
}

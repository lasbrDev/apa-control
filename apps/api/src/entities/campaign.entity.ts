import type { CampaignStatusValue } from '@/database/schema/enums/campaign-status'
import type { Decimal } from 'decimal.js'

export class Campaign {
  id?: number
  campaignTypeId: number
  title: string
  description: string
  startDate: string
  endDate: string
  fundraisingGoal: Decimal | null
  status: CampaignStatusValue
  proof?: string | null
  observations?: string | null
  createdAt: Date
  updatedAt?: Date | null

  constructor(props: Omit<Campaign, 'id'>, id?: number) {
    this.id = id
    this.campaignTypeId = props.campaignTypeId
    this.title = props.title
    this.description = props.description
    this.startDate = props.startDate
    this.endDate = props.endDate
    this.fundraisingGoal = props.fundraisingGoal
    this.status = props.status
    this.proof = props.proof
    this.observations = props.observations
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }
}

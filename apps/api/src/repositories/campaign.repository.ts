import { db } from '@/database/client'
import { campaign, campaignType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Campaign } from '@/entities'
import type { CampaignWithDetails, ListCampaignsData } from '@/use-cases/campaign/list-campaigns/list-campaigns.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, eq, gte, ilike, lte } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: campaign,
  initialOrderBy: campaign.startDate,
  includes: [[campaignType, eq(campaignType.id, campaign.campaignTypeId)]],
  customFields: {
    campaignTypeName: campaignType.name,
  },
}

export class CampaignRepository {
  create(data: Campaign, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(campaign).values(data).returning({ id: campaign.id })
  }

  async list(data: ListCampaignsData): Promise<[number, CampaignWithDetails[]]> {
    const { title, status, campaignTypeId, startDate, endDate } = data
    const whereList: SQL[] = []

    if (title) whereList.push(ilike(campaign.title, `%${title}%`))
    if (status) whereList.push(eq(campaign.status, status))
    if (campaignTypeId) whereList.push(eq(campaign.campaignTypeId, campaignTypeId))
    if (startDate) whereList.push(gte(campaign.startDate, startDate))
    if (endDate) whereList.push(lte(campaign.endDate, endDate))

    const [sqlQuery, countQuery] = querifyString<CampaignWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: campaign.id,
        campaignTypeId: campaign.campaignTypeId,
        title: campaign.title,
        description: campaign.description,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        fundraisingGoal: campaign.fundraisingGoal,
        status: campaign.status,
        proof: campaign.proof,
        observations: campaign.observations,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        campaignTypeName: campaignType.name,
      })
      .from(campaign)
      .leftJoin(campaignType, eq(campaignType.id, campaign.campaignTypeId))
      .where(eq(campaign.id, id))

    if (!item) return null
    return item
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Campanha não encontrada.', 404)
    return item
  }

  async update(id: number, data: Partial<Omit<Campaign, 'id'>>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.update(campaign).set(data).where(eq(campaign.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(campaign).where(eq(campaign.id, id))
  }
}

import { db } from '@/database/client'
import { campaignType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { CampaignType } from '@/entities'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { asc, eq } from 'drizzle-orm'

const querifySettings: QuerySettings = {
  table: campaignType,
  initialOrderBy: campaignType.name,
}

export class CampaignTypeRepository {
  async create(data: CampaignType) {
    const [result] = await db.insert(campaignType).values(data).returning({ id: campaignType.id })

    return result
  }

  async update(id: number, data: Partial<CampaignType>) {
    await db.update(campaignType).set(data).where(eq(campaignType.id, id))
  }

  list() {
    return db
      .select({
        id: campaignType.id,
        name: campaignType.name,
        category: campaignType.category,
        active: campaignType.active,
      })
      .from(campaignType)
      .orderBy(asc(campaignType.name))
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<CampaignType>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(campaignType).where(eq(campaignType.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: campaignType.id,
        name: campaignType.name,
        description: campaignType.description,
        category: campaignType.category,
        active: campaignType.active,
        createdAt: campaignType.createdAt,
      })
      .from(campaignType)
      .where(eq(campaignType.id, id))
      .limit(1)

    if (!first) {
      return null
    }

    return first
  }

  async findByIdOrThrow(id: number) {
    const [first] = await db
      .select({
        id: campaignType.id,
        name: campaignType.name,
        description: campaignType.description,
        category: campaignType.category,
        active: campaignType.active,
        createdAt: campaignType.createdAt,
      })
      .from(campaignType)
      .where(eq(campaignType.id, id))
      .limit(1)

    if (!first) {
      throw new ApiError('Tipo de campanha não encontrado.', 404)
    }

    return first
  }
}

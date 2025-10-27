import { db } from '@/database/client'
import { finalDestinationType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { FinalDestinationType } from '@/entities'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { asc, eq } from 'drizzle-orm'

const querifySettings: QuerySettings = {
  table: finalDestinationType,
  initialOrderBy: finalDestinationType.name,
}

export class FinalDestinationTypeRepository {
  async create(data: FinalDestinationType) {
    const [result] = await db.insert(finalDestinationType).values(data).returning({ id: finalDestinationType.id })

    return result
  }

  async update(id: number, data: Partial<FinalDestinationType>) {
    await db.update(finalDestinationType).set(data).where(eq(finalDestinationType.id, id))
  }

  list() {
    return db
      .select({
        id: finalDestinationType.id,
        name: finalDestinationType.name,
        requiresApproval: finalDestinationType.requiresApproval,
        active: finalDestinationType.active,
      })
      .from(finalDestinationType)
      .orderBy(asc(finalDestinationType.name))
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<FinalDestinationType>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(finalDestinationType).where(eq(finalDestinationType.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: finalDestinationType.id,
        name: finalDestinationType.name,
        description: finalDestinationType.description,
        requiresApproval: finalDestinationType.requiresApproval,
        active: finalDestinationType.active,
        createdAt: finalDestinationType.createdAt,
      })
      .from(finalDestinationType)
      .where(eq(finalDestinationType.id, id))
      .limit(1)

    if (!first) {
      return null
    }

    return first
  }

  async findByIdOrThrow(id: number) {
    const [first] = await db
      .select({
        id: finalDestinationType.id,
        name: finalDestinationType.name,
        description: finalDestinationType.description,
        requiresApproval: finalDestinationType.requiresApproval,
        active: finalDestinationType.active,
        createdAt: finalDestinationType.createdAt,
      })
      .from(finalDestinationType)
      .where(eq(finalDestinationType.id, id))
      .limit(1)

    if (!first) {
      throw new ApiError('Tipo de destino final não encontrado.', 404)
    }

    return first
  }
}

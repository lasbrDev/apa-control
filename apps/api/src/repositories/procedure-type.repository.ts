import { db } from '@/database/client'
import { procedureType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { ProcedureType } from '@/entities'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { asc, eq } from 'drizzle-orm'

const querifySettings: QuerySettings = {
  table: procedureType,
  initialOrderBy: procedureType.name,
}

export class ProcedureTypeRepository {
  async create(data: ProcedureType) {
    const [result] = await db.insert(procedureType).values(data).returning({ id: procedureType.id })

    return result
  }

  async update(id: number, data: Partial<ProcedureType>) {
    await db.update(procedureType).set(data).where(eq(procedureType.id, id))
  }

  list() {
    return db
      .select({
        id: procedureType.id,
        name: procedureType.name,
        category: procedureType.category,
        averageCost: procedureType.averageCost,
        active: procedureType.active,
      })
      .from(procedureType)
      .where(eq(procedureType.active, true))
      .orderBy(asc(procedureType.name))
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<ProcedureType>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(procedureType).where(eq(procedureType.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: procedureType.id,
        name: procedureType.name,
        description: procedureType.description,
        category: procedureType.category,
        averageCost: procedureType.averageCost,
        active: procedureType.active,
        createdAt: procedureType.createdAt,
      })
      .from(procedureType)
      .where(eq(procedureType.id, id))
      .limit(1)

    if (!first) {
      return null
    }

    return first
  }

  async findByIdOrThrow(id: number) {
    const [first] = await db
      .select({
        id: procedureType.id,
        name: procedureType.name,
        description: procedureType.description,
        category: procedureType.category,
        averageCost: procedureType.averageCost,
        active: procedureType.active,
        createdAt: procedureType.createdAt,
      })
      .from(procedureType)
      .where(eq(procedureType.id, id))
      .limit(1)

    if (!first) {
      throw new ApiError('Tipo de procedimento não encontrado.', 404)
    }

    return first
  }
}

import { db } from '@/database/client'
import { occurrence, occurrenceType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { OccurrenceType } from '@/entities'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { asc, eq } from 'drizzle-orm'

const querifySettings: QuerySettings = {
  table: occurrenceType,
  initialOrderBy: occurrenceType.name,
}

export class OccurrenceTypeRepository {
  async hasName(name: string) {
    const count = await db.$count(occurrenceType, eq(occurrenceType.name, name))
    return count > 0
  }

  async create(data: OccurrenceType) {
    const [result] = await db.insert(occurrenceType).values(data).returning({ id: occurrenceType.id })
    return result
  }

  async update(id: number, data: Partial<OccurrenceType>) {
    await db.update(occurrenceType).set(data).where(eq(occurrenceType.id, id))
  }

  list() {
    return db
      .select({
        id: occurrenceType.id,
        name: occurrenceType.name,
        active: occurrenceType.active,
      })
      .from(occurrenceType)
      .orderBy(asc(occurrenceType.name))
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<OccurrenceType>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(occurrenceType).where(eq(occurrenceType.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: occurrenceType.id,
        name: occurrenceType.name,
        description: occurrenceType.description,
        active: occurrenceType.active,
        createdAt: occurrenceType.createdAt,
      })
      .from(occurrenceType)
      .where(eq(occurrenceType.id, id))
      .limit(1)
    return first ?? null
  }

  async findByIdOrThrow(id: number) {
    const first = await this.findById(id)
    if (!first) throw new ApiError('Tipo de ocorrência não encontrado.', 404)
    return first
  }

  async countByOccurrenceTypeId(occurrenceTypeId: number, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.$count(occurrence, eq(occurrence.occurrenceTypeId, occurrenceTypeId))
  }
}

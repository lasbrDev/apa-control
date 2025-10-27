import { db } from '@/database/client'
import { transactionType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { TransactionType } from '@/entities'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { asc, eq } from 'drizzle-orm'

const querifySettings: QuerySettings = {
  table: transactionType,
  initialOrderBy: transactionType.name,
}

export class TransactionTypeRepository {
  async create(data: TransactionType) {
    const [result] = await db.insert(transactionType).values(data).returning({ id: transactionType.id })

    return result
  }

  async update(id: number, data: Partial<TransactionType>) {
    await db.update(transactionType).set(data).where(eq(transactionType.id, id))
  }

  list() {
    return db
      .select({
        id: transactionType.id,
        name: transactionType.name,
        category: transactionType.category,
        active: transactionType.active,
      })
      .from(transactionType)
      .orderBy(asc(transactionType.name))
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<TransactionType>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(transactionType).where(eq(transactionType.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: transactionType.id,
        name: transactionType.name,
        category: transactionType.category,
        description: transactionType.description,
        active: transactionType.active,
        createdAt: transactionType.createdAt,
      })
      .from(transactionType)
      .where(eq(transactionType.id, id))
      .limit(1)

    if (!first) {
      return null
    }

    return first
  }

  async findByIdOrThrow(id: number) {
    const [first] = await db
      .select({
        id: transactionType.id,
        name: transactionType.name,
        category: transactionType.category,
        description: transactionType.description,
        active: transactionType.active,
        createdAt: transactionType.createdAt,
      })
      .from(transactionType)
      .where(eq(transactionType.id, id))
      .limit(1)

    if (!first) {
      throw new ApiError('Tipo de transação não encontrado.', 404)
    }

    return first
  }
}

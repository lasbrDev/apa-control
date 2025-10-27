import { db } from '@/database/client'
import { appointmentType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { AppointmentType } from '@/entities'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { asc, eq } from 'drizzle-orm'

const querifySettings: QuerySettings = {
  table: appointmentType,
  initialOrderBy: appointmentType.name,
}

export class AppointmentTypeRepository {
  async create(data: AppointmentType) {
    const [result] = await db.insert(appointmentType).values(data).returning({ id: appointmentType.id })

    return result
  }

  async update(id: number, data: Partial<AppointmentType>) {
    await db.update(appointmentType).set(data).where(eq(appointmentType.id, id))
  }

  list() {
    return db
      .select({
        id: appointmentType.id,
        name: appointmentType.name,
        urgency: appointmentType.urgency,
        active: appointmentType.active,
      })
      .from(appointmentType)
      .orderBy(asc(appointmentType.name))
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<AppointmentType>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(appointmentType).where(eq(appointmentType.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: appointmentType.id,
        name: appointmentType.name,
        description: appointmentType.description,
        urgency: appointmentType.urgency,
        active: appointmentType.active,
        createdAt: appointmentType.createdAt,
      })
      .from(appointmentType)
      .where(eq(appointmentType.id, id))
      .limit(1)

    if (!first) {
      return null
    }

    return first
  }

  async findByIdOrThrow(id: number) {
    const [first] = await db
      .select({
        id: appointmentType.id,
        name: appointmentType.name,
        description: appointmentType.description,
        urgency: appointmentType.urgency,
        active: appointmentType.active,
        createdAt: appointmentType.createdAt,
      })
      .from(appointmentType)
      .where(eq(appointmentType.id, id))
      .limit(1)

    if (!first) {
      throw new ApiError('Tipo de consulta não encontrado.', 404)
    }

    return first
  }
}

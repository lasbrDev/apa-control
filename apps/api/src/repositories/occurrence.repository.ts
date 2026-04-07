import { db } from '@/database/client'
import { animal, employee, occurrence, occurrenceType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Occurrence } from '@/entities'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { endOfDay, parseISO, startOfDay } from 'date-fns'
import { type SQL, eq, gte, ilike, lte } from 'drizzle-orm'

export interface ListOccurrencesData {
  animalName?: string
  occurrenceTypeId?: number
  employeeId?: number
  occurrenceDateStart?: string
  occurrenceDateEnd?: string
  page?: number
  perPage?: number
  sort?: Array<{ name: string; order: string }>
  fields?: string[]
}

export interface OccurrenceWithDetails {
  id: number
  animalId: number
  occurrenceTypeId: number
  employeeId: number
  occurrenceDate: Date
  description: string
  observations: string | null
  createdAt: Date
  updatedAt: Date | null
  animalName?: string | null
  occurrenceTypeName?: string | null
  employeeName?: string | null
}

const querifyStringSettings: QueryStringSettings = {
  table: occurrence,
  initialOrderBy: occurrence.occurrenceDate,
  includes: [
    [animal, eq(animal.id, occurrence.animalId)],
    [occurrenceType, eq(occurrenceType.id, occurrence.occurrenceTypeId)],
    [employee, eq(employee.id, occurrence.employeeId)],
  ],
  customFields: {
    animalName: animal.name,
    occurrenceTypeName: occurrenceType.name,
    employeeName: employee.name,
  },
}

export class OccurrenceRepository {
  create(data: Occurrence, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(occurrence).values(data).returning({ id: occurrence.id })
  }

  async list(data: ListOccurrencesData): Promise<[number, OccurrenceWithDetails[]]> {
    const { animalName, occurrenceTypeId, employeeId, occurrenceDateStart, occurrenceDateEnd } = data
    const whereList: SQL[] = []

    if (animalName) whereList.push(ilike(animal.name, `%${animalName}%`))
    if (occurrenceTypeId) whereList.push(eq(occurrence.occurrenceTypeId, occurrenceTypeId))
    if (employeeId) whereList.push(eq(occurrence.employeeId, employeeId))
    if (occurrenceDateStart)
      whereList.push(
        gte(
          occurrence.occurrenceDate,
          startOfDay(parseISO(occurrenceDateStart, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )
    if (occurrenceDateEnd)
      whereList.push(
        lte(
          occurrence.occurrenceDate,
          endOfDay(parseISO(occurrenceDateEnd, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )

    const [sqlQuery, countQuery] = querifyString<OccurrenceWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery
    return [total, items]
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: occurrence.id,
        animalId: occurrence.animalId,
        occurrenceTypeId: occurrence.occurrenceTypeId,
        employeeId: occurrence.employeeId,
        occurrenceDate: occurrence.occurrenceDate,
        description: occurrence.description,
        observations: occurrence.observations,
        createdAt: occurrence.createdAt,
        updatedAt: occurrence.updatedAt,
        animalName: animal.name,
        occurrenceTypeName: occurrenceType.name,
        employeeName: employee.name,
      })
      .from(occurrence)
      .leftJoin(animal, eq(animal.id, occurrence.animalId))
      .leftJoin(occurrenceType, eq(occurrenceType.id, occurrence.occurrenceTypeId))
      .leftJoin(employee, eq(employee.id, occurrence.employeeId))
      .where(eq(occurrence.id, id))

    return item ?? null
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Ocorrência não encontrada.', 404)
    return item
  }

  async update(id: number, data: Partial<Omit<Occurrence, 'id'>>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.update(occurrence).set(data).where(eq(occurrence.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(occurrence).where(eq(occurrence.id, id))
  }
}

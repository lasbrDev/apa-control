import { db } from '@/database/client'
import { animal, rescue } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Rescue } from '@/entities'
import type { ListRescuesData, RescueWithDetails } from '@/use-cases/rescue/list-rescues/list-rescues.dto'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, eq, gte, ilike, lte } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: rescue,
  initialOrderBy: rescue.rescueDate,
  includes: [[animal, eq(animal.id, rescue.animalId)]],
  customFields: {
    animalName: animal.name,
  },
}

export class RescueRepository {
  create(data: Rescue, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(rescue).values(data).returning({ id: rescue.id })
  }

  async list(data: ListRescuesData): Promise<[number, RescueWithDetails[]]> {
    const { locationFound, animalName, rescueDateStart, rescueDateEnd, animalId } = data
    const whereList: SQL[] = []

    if (animalId) {
      whereList.push(eq(rescue.animalId, animalId))
    }

    if (locationFound) {
      whereList.push(ilike(rescue.locationFound, `%${locationFound}%`))
    }

    if (animalName) {
      whereList.push(ilike(animal.name, `%${animalName}%`))
    }

    if (rescueDateStart) {
      const startDate = new Date(`${rescueDateStart}T00:00:00`)
      whereList.push(gte(rescue.rescueDate, startDate))
    }

    if (rescueDateEnd) {
      const endDate = new Date(`${rescueDateEnd}T23:59:59.999`)
      whereList.push(lte(rescue.rescueDate, endDate))
    }

    const [sqlQuery, countQuery] = querifyString<RescueWithDetails>(data, whereList, querifyStringSettings)

    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: rescue.id,
        animalId: rescue.animalId,
        employeeId: rescue.employeeId,
        rescueDate: rescue.rescueDate,
        locationFound: rescue.locationFound,
        circumstances: rescue.circumstances,
        foundConditions: rescue.foundConditions,
        immediateProcedures: rescue.immediateProcedures,
        observations: rescue.observations,
        createdAt: rescue.createdAt,
        animalName: animal.name,
      })
      .from(rescue)
      .leftJoin(animal, eq(animal.id, rescue.animalId))
      .where(eq(rescue.id, id))

    if (!item) {
      return null
    }

    return item
  }

  async update(id: number, data: Partial<Omit<Rescue, 'id'>>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.update(rescue).set(data).where(eq(rescue.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(rescue).where(eq(rescue.id, id))
  }

  async findExistingRescue(animalId: number) {
    const [existingRescue] = await db.select().from(rescue).where(eq(rescue.animalId, animalId)).limit(1)
    return !!existingRescue
  }
}

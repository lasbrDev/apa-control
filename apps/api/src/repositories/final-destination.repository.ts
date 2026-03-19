import { db } from '@/database/client'
import { animal, employee, finalDestination, finalDestinationType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { FinalDestination } from '@/entities'
import type {
  FinalDestinationWithDetails,
  ListFinalDestinationsData,
} from '@/use-cases/final-destination/list-final-destinations/list-final-destinations.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, and, eq, gte, ilike, lte, ne } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: finalDestination,
  initialOrderBy: finalDestination.destinationDate,
  includes: [
    [animal, eq(animal.id, finalDestination.animalId)],
    [finalDestinationType, eq(finalDestinationType.id, finalDestination.destinationTypeId)],
    [employee, eq(employee.id, finalDestination.employeeId)],
  ],
  customFields: {
    animalName: animal.name,
    destinationTypeName: finalDestinationType.name,
    employeeName: employee.name,
  },
}

export class FinalDestinationRepository {
  create(data: FinalDestination, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(finalDestination).values(data).returning({ id: finalDestination.id })
  }

  async list(data: ListFinalDestinationsData): Promise<[number, FinalDestinationWithDetails[]]> {
    const { animalName, destinationTypeId, destinationDateStart, destinationDateEnd, employeeId } = data
    const whereList: SQL[] = []

    if (animalName) whereList.push(ilike(animal.name, `%${animalName}%`))
    if (destinationTypeId) whereList.push(eq(finalDestination.destinationTypeId, destinationTypeId))
    if (employeeId) whereList.push(eq(finalDestination.employeeId, employeeId))

    if (destinationDateStart) whereList.push(gte(finalDestination.destinationDate, destinationDateStart))

    if (destinationDateEnd) whereList.push(lte(finalDestination.destinationDate, destinationDateEnd))

    const [sqlQuery, countQuery] = querifyString<FinalDestinationWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findByAnimalId(animalId: number) {
    const [item] = await db
      .select({ id: finalDestination.id })
      .from(finalDestination)
      .where(eq(finalDestination.animalId, animalId))
    return item ?? null
  }

  async findByAnimalIdExceptId(animalId: number, id: number) {
    const [item] = await db
      .select({ id: finalDestination.id })
      .from(finalDestination)
      .where(and(eq(finalDestination.animalId, animalId), ne(finalDestination.id, id)))
    return item ?? null
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: finalDestination.id,
        animalId: finalDestination.animalId,
        destinationTypeId: finalDestination.destinationTypeId,
        employeeId: finalDestination.employeeId,
        destinationDate: finalDestination.destinationDate,
        reason: finalDestination.reason,
        observations: finalDestination.observations,
        proof: finalDestination.proof,
        createdAt: finalDestination.createdAt,
        animalName: animal.name,
        destinationTypeName: finalDestinationType.name,
        employeeName: employee.name,
      })
      .from(finalDestination)
      .leftJoin(animal, eq(animal.id, finalDestination.animalId))
      .leftJoin(finalDestinationType, eq(finalDestinationType.id, finalDestination.destinationTypeId))
      .leftJoin(employee, eq(employee.id, finalDestination.employeeId))
      .where(eq(finalDestination.id, id))

    if (!item) return null
    return item
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Destino final não encontrado.', 404)
    return item
  }

  async update(
    id: number,
    data: Partial<Omit<FinalDestination, 'id'>>,
    dbTransaction: DrizzleTransaction | null = null,
  ) {
    const connection = dbTransaction ?? db
    await connection.update(finalDestination).set(data).where(eq(finalDestination.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(finalDestination).where(eq(finalDestination.id, id))
  }
}

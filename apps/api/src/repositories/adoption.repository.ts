import { db } from '@/database/client'
import { adopter, adoption, animal, employee } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Adoption } from '@/entities'
import type { AdoptionWithDetails, ListAdoptionsData } from '@/use-cases/adoption/list-adoptions/list-adoptions.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, and, eq, gte, ilike, inArray, lte, ne } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: adoption,
  initialOrderBy: adoption.adoptionDate,
  includes: [
    [animal, eq(animal.id, adoption.animalId)],
    [adopter, eq(adopter.id, adoption.adopterId)],
    [employee, eq(employee.id, adoption.employeeId)],
  ],
  customFields: {
    animalName: animal.name,
    adopterName: adopter.name,
    employeeName: employee.name,
  },
}

export class AdoptionRepository {
  create(data: Adoption, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(adoption).values(data).returning({ id: adoption.id })
  }

  async list(data: ListAdoptionsData): Promise<[number, AdoptionWithDetails[]]> {
    const { animalName, adopterName, status, employeeId, adoptionDateStart, adoptionDateEnd } = data
    const whereList: SQL[] = []

    if (animalName) whereList.push(ilike(animal.name, `%${animalName}%`))
    if (adopterName) whereList.push(ilike(adopter.name, `%${adopterName}%`))
    if (status) whereList.push(eq(adoption.status, status))
    if (employeeId) whereList.push(eq(adoption.employeeId, employeeId))
    if (adoptionDateStart) whereList.push(gte(adoption.adoptionDate, adoptionDateStart))
    if (adoptionDateEnd) whereList.push(lte(adoption.adoptionDate, adoptionDateEnd))

    const [sqlQuery, countQuery] = querifyString<AdoptionWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findByAnimalId(animalId: number) {
    const [item] = await db.select({ id: adoption.id }).from(adoption).where(eq(adoption.animalId, animalId))
    return item ?? null
  }

  async findByAnimalIdExceptId(animalId: number, id: number) {
    const [item] = await db
      .select({ id: adoption.id })
      .from(adoption)
      .where(and(eq(adoption.animalId, animalId), ne(adoption.id, id)))
    return item ?? null
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: adoption.id,
        animalId: adoption.animalId,
        adopterId: adoption.adopterId,
        employeeId: adoption.employeeId,
        adoptionDate: adoption.adoptionDate,
        adaptationPeriod: adoption.adaptationPeriod,
        status: adoption.status,
        observations: adoption.observations,
        proof: adoption.proof,
        createdAt: adoption.createdAt,
        updatedAt: adoption.updatedAt,
        animalName: animal.name,
        adopterName: adopter.name,
        employeeName: employee.name,
      })
      .from(adoption)
      .leftJoin(animal, eq(animal.id, adoption.animalId))
      .leftJoin(adopter, eq(adopter.id, adoption.adopterId))
      .leftJoin(employee, eq(employee.id, adoption.employeeId))
      .where(eq(adoption.id, id))

    if (!item) return null
    return item
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Adoção não encontrada.', 404)
    return item
  }

  async update(id: number, data: Partial<Omit<Adoption, 'id'>>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection
      .update(adoption)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(adoption.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(adoption).where(eq(adoption.id, id))
  }

  async findByIds(ids: number[]) {
    return db.select().from(adoption).where(inArray(adoption.id, ids))
  }

  async cancelByIds(ids: number[]) {
    await db.update(adoption).set({ status: 'cancelada', updatedAt: new Date() }).where(inArray(adoption.id, ids))
  }

  async confirmByIds(ids: number[]) {
    await db.update(adoption).set({ status: 'concluida', updatedAt: new Date() }).where(inArray(adoption.id, ids))
  }
}

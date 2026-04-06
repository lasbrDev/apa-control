import { db } from '@/database/client'
import { anamnesis, animal, appointment, employee } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Anamnesis } from '@/entities'
import type { AnamnesisWithDetails, ListAnamnesesData } from '@/use-cases/anamnesis/list-anamneses/list-anamneses.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, and, eq, gte, ilike, lte, ne } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: anamnesis,
  initialOrderBy: anamnesis.createdAt,
  includes: [
    [appointment, eq(appointment.id, anamnesis.appointmentId)],
    [animal, eq(animal.id, appointment.animalId)],
    [employee, eq(employee.id, appointment.employeeId)],
  ],
  customFields: {
    animalName: animal.name,
    appointmentDate: appointment.appointmentDate,
    employeeName: employee.name,
  },
}

export class AnamnesisRepository {
  create(data: Anamnesis, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(anamnesis).values(data).returning({ id: anamnesis.id })
  }

  async list(data: ListAnamnesesData): Promise<[number, AnamnesisWithDetails[]]> {
    const { animalName, appointmentId, employeeId, createdDateStart, createdDateEnd } = data
    const whereList: SQL[] = []

    if (animalName) whereList.push(ilike(animal.name, `%${animalName}%`))
    if (appointmentId) whereList.push(eq(anamnesis.appointmentId, appointmentId))
    if (employeeId) whereList.push(eq(appointment.employeeId, employeeId))
    if (createdDateStart) whereList.push(gte(anamnesis.createdAt, new Date(createdDateStart)))
    if (createdDateEnd) whereList.push(lte(anamnesis.createdAt, new Date(createdDateEnd)))

    const [sqlQuery, countQuery] = querifyString<AnamnesisWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findByAppointmentId(appointmentId: number) {
    const [item] = await db
      .select({ id: anamnesis.id })
      .from(anamnesis)
      .where(eq(anamnesis.appointmentId, appointmentId))
    return item ?? null
  }

  async countByAppointmentId(appointmentId: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    return await connection.$count(anamnesis, eq(anamnesis.appointmentId, appointmentId))
  }

  async findByAppointmentIdExceptId(appointmentId: number, id: number) {
    const [item] = await db
      .select({ id: anamnesis.id })
      .from(anamnesis)
      .where(and(eq(anamnesis.appointmentId, appointmentId), ne(anamnesis.id, id)))
    return item ?? null
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: anamnesis.id,
        appointmentId: anamnesis.appointmentId,
        symptomsPresented: anamnesis.symptomsPresented,
        dietaryHistory: anamnesis.dietaryHistory,
        behavioralHistory: anamnesis.behavioralHistory,
        requestedExams: anamnesis.requestedExams,
        presumptiveDiagnosis: anamnesis.presumptiveDiagnosis,
        observations: anamnesis.observations,
        proof: anamnesis.proof,
        createdAt: anamnesis.createdAt,
        animalName: animal.name,
        appointmentDate: appointment.appointmentDate,
        employeeName: employee.name,
      })
      .from(anamnesis)
      .leftJoin(appointment, eq(appointment.id, anamnesis.appointmentId))
      .leftJoin(animal, eq(animal.id, appointment.animalId))
      .leftJoin(employee, eq(employee.id, appointment.employeeId))
      .where(eq(anamnesis.id, id))

    if (!item) return null
    return item
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Anamnese não encontrada.', 404)
    return item
  }

  async update(id: number, data: Partial<Omit<Anamnesis, 'id'>>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.update(anamnesis).set(data).where(eq(anamnesis.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(anamnesis).where(eq(anamnesis.id, id))
  }
}

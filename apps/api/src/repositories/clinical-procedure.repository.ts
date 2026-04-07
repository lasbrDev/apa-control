import { db } from '@/database/client'
import { animal, appointment, clinicalProcedure, employee, procedureType } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { ClinicalProcedure } from '@/entities'
import type {
  ClinicalProcedureWithDetails,
  ListClinicalProceduresData,
} from '@/use-cases/clinical-procedure/list-clinical-procedures/list-clinical-procedures.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { endOfDay, parseISO, startOfDay } from 'date-fns'
import { type SQL, eq, gte, ilike, lte } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: clinicalProcedure,
  initialOrderBy: clinicalProcedure.procedureDate,
  includes: [
    [animal, eq(animal.id, clinicalProcedure.animalId)],
    [procedureType, eq(procedureType.id, clinicalProcedure.procedureTypeId)],
    [appointment, eq(appointment.id, clinicalProcedure.appointmentId)],
    [employee, eq(employee.id, clinicalProcedure.employeeId)],
  ],
  customFields: {
    animalName: animal.name,
    procedureTypeName: procedureType.name,
    appointmentDate: appointment.appointmentDate,
    employeeName: employee.name,
  },
}

export class ClinicalProcedureRepository {
  create(data: ClinicalProcedure, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(clinicalProcedure).values(data).returning({ id: clinicalProcedure.id })
  }

  async list(data: ListClinicalProceduresData): Promise<[number, ClinicalProcedureWithDetails[]]> {
    const { animalName, procedureTypeId, appointmentId, employeeId, status, procedureDateStart, procedureDateEnd } =
      data
    const whereList: SQL[] = []

    if (animalName) whereList.push(ilike(animal.name, `%${animalName}%`))
    if (procedureTypeId) whereList.push(eq(clinicalProcedure.procedureTypeId, procedureTypeId))
    if (appointmentId) whereList.push(eq(clinicalProcedure.appointmentId, appointmentId))
    if (employeeId) whereList.push(eq(clinicalProcedure.employeeId, employeeId))
    if (status) whereList.push(eq(clinicalProcedure.status, status))
    if (procedureDateStart)
      whereList.push(
        gte(
          clinicalProcedure.procedureDate,
          startOfDay(parseISO(procedureDateStart, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )
    if (procedureDateEnd)
      whereList.push(
        lte(
          clinicalProcedure.procedureDate,
          endOfDay(parseISO(procedureDateEnd, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )

    const [sqlQuery, countQuery] = querifyString<ClinicalProcedureWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: clinicalProcedure.id,
        animalId: clinicalProcedure.animalId,
        procedureTypeId: clinicalProcedure.procedureTypeId,
        appointmentId: clinicalProcedure.appointmentId,
        employeeId: clinicalProcedure.employeeId,
        procedureDate: clinicalProcedure.procedureDate,
        description: clinicalProcedure.description,
        actualCost: clinicalProcedure.actualCost,
        observations: clinicalProcedure.observations,
        status: clinicalProcedure.status,
        createdAt: clinicalProcedure.createdAt,
        animalName: animal.name,
        procedureTypeName: procedureType.name,
        appointmentDate: appointment.appointmentDate,
        employeeName: employee.name,
      })
      .from(clinicalProcedure)
      .leftJoin(animal, eq(animal.id, clinicalProcedure.animalId))
      .leftJoin(procedureType, eq(procedureType.id, clinicalProcedure.procedureTypeId))
      .leftJoin(appointment, eq(appointment.id, clinicalProcedure.appointmentId))
      .leftJoin(employee, eq(employee.id, clinicalProcedure.employeeId))
      .where(eq(clinicalProcedure.id, id))

    if (!item) return null
    return item
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Procedimento clínico não encontrado.', 404)
    return item
  }

  async countByAppointmentId(appointmentId: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    return await connection.$count(clinicalProcedure, eq(clinicalProcedure.appointmentId, appointmentId))
  }

  async update(
    id: number,
    data: Partial<Omit<ClinicalProcedure, 'id'>>,
    dbTransaction: DrizzleTransaction | null = null,
  ) {
    const connection = dbTransaction ?? db
    await connection.update(clinicalProcedure).set(data).where(eq(clinicalProcedure.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(clinicalProcedure).where(eq(clinicalProcedure.id, id))
  }
}

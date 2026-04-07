import { db } from '@/database/client'
import { animal, appointment, appointmentType, employee, veterinaryClinic } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Appointment } from '@/entities'
import type {
  AppointmentWithDetails,
  ListAppointmentsData,
} from '@/use-cases/appointment/list-appointments/list-appointments.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { endOfDay, parseISO, startOfDay } from 'date-fns'
import { type SQL, eq, gte, ilike, lte } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: appointment,
  initialOrderBy: appointment.appointmentDate,
  includes: [
    [animal, eq(animal.id, appointment.animalId)],
    [appointmentType, eq(appointmentType.id, appointment.appointmentTypeId)],
    [employee, eq(employee.id, appointment.employeeId)],
    [veterinaryClinic, eq(veterinaryClinic.id, appointment.clinicId)],
  ],
  customFields: {
    animalName: animal.name,
    appointmentTypeName: appointmentType.name,
    employeeName: employee.name,
    clinicName: veterinaryClinic.name,
  },
}

export class AppointmentRepository {
  create(data: Appointment, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(appointment).values(data).returning({ id: appointment.id })
  }

  async list(data: ListAppointmentsData): Promise<[number, AppointmentWithDetails[]]> {
    const {
      animalName,
      appointmentTypeId,
      clinicId,
      consultationType,
      status,
      employeeId,
      appointmentDateStart,
      appointmentDateEnd,
    } = data
    const whereList: SQL[] = []

    if (animalName) whereList.push(ilike(animal.name, `%${animalName}%`))
    if (appointmentTypeId) whereList.push(eq(appointment.appointmentTypeId, appointmentTypeId))
    if (clinicId) whereList.push(eq(appointment.clinicId, clinicId))
    if (consultationType) whereList.push(eq(appointment.consultationType, consultationType))
    if (status) whereList.push(eq(appointment.status, status))
    if (employeeId) whereList.push(eq(appointment.employeeId, employeeId))
    if (appointmentDateStart)
      whereList.push(
        gte(
          appointment.appointmentDate,
          startOfDay(parseISO(appointmentDateStart, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )
    if (appointmentDateEnd)
      whereList.push(
        lte(
          appointment.appointmentDate,
          endOfDay(parseISO(appointmentDateEnd, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )

    const [sqlQuery, countQuery] = querifyString<AppointmentWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items]
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: appointment.id,
        animalId: appointment.animalId,
        appointmentTypeId: appointment.appointmentTypeId,
        clinicId: appointment.clinicId,
        employeeId: appointment.employeeId,
        appointmentDate: appointment.appointmentDate,
        consultationType: appointment.consultationType,
        status: appointment.status,
        observations: appointment.observations,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        animalName: animal.name,
        appointmentTypeName: appointmentType.name,
        employeeName: employee.name,
        clinicName: veterinaryClinic.name,
      })
      .from(appointment)
      .leftJoin(animal, eq(animal.id, appointment.animalId))
      .leftJoin(appointmentType, eq(appointmentType.id, appointment.appointmentTypeId))
      .leftJoin(employee, eq(employee.id, appointment.employeeId))
      .leftJoin(veterinaryClinic, eq(veterinaryClinic.id, appointment.clinicId))
      .where(eq(appointment.id, id))

    if (!item) return null
    return item
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Consulta não encontrada.', 404)
    return item
  }

  async update(id: number, data: Partial<Omit<Appointment, 'id'>>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.update(appointment).set(data).where(eq(appointment.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(appointment).where(eq(appointment.id, id))
  }
}

import { and, eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { animalHistory, appointment } from '@/database/schema'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { AppointmentTypeFactory } from '@/tests/factories/appointment-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { ProcedureTypeFactory } from '@/tests/factories/procedure-type'
import { VeterinaryClinicFactory } from '@/tests/factories/veterinary-clinic'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { clinicalProcedureRoutes } from '@/http/controllers/clinical-procedure/routes'

describe('Clinical procedure lifecycle', () => {
  const app = createBaseApp()
  let employeeId: number

  beforeAll(async () => {
    await app.register(clinicalProcedureRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  async function createAppointmentForAnimal(animalId: number) {
    const appointmentType = await AppointmentTypeFactory.create({ active: true })
    const clinic = await VeterinaryClinicFactory.create({ active: true })

    const [createdAppointment] = await db
      .insert(appointment)
      .values({
        animalId,
        appointmentTypeId: appointmentType.id,
        clinicId: clinic.id,
        employeeId,
        appointmentDate: new Date(),
        consultationType: 'clinica',
        status: 'agendado',
        observations: null,
        createdAt: new Date(),
        updatedAt: null,
      })
      .returning()

    return createdAppointment
  }

  it('should create/update/delete procedure and write animal history', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'ClinicalProcedures'] })
    const animal = await AnimalFactory.create()
    const appointmentRecord = await createAppointmentForAnimal(animal.id)
    const procedureType = await ProcedureTypeFactory.create({ active: true })

    const createResponse = await app.inject({
      method: 'POST',
      url: '/clinical-procedure.add',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        animalId: animal.id,
        procedureTypeId: procedureType.id,
        appointmentId: appointmentRecord.id,
        procedureDate: new Date().toISOString(),
        description: 'Curativo',
        actualCost: 120.5,
        status: 'agendado',
      },
    })

    expect(createResponse.statusCode).toBe(201)
    const { id } = createResponse.json<{ id: number }>()

    const [createdHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'clinical-procedure.created')))
    expect(createdHistory).toBeTruthy()

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/clinical-procedure.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id,
        animalId: animal.id,
        procedureTypeId: procedureType.id,
        appointmentId: appointmentRecord.id,
        procedureDate: new Date(Date.now() + 600_000).toISOString(),
        description: 'Curativo e limpeza',
        actualCost: 150,
        status: 'realizado',
      },
    })

    expect(updateResponse.statusCode).toBe(204)

    const [updatedHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'clinical-procedure.updated')))
    expect(updatedHistory).toBeTruthy()

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/clinical-procedure.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(deleteResponse.statusCode).toBe(200)

    const [deletedHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'clinical-procedure.deleted')))
    expect(deletedHistory).toBeTruthy()
  })

  it('should reject procedure when appointment belongs to another animal', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'ClinicalProcedures'] })
    const animalA = await AnimalFactory.create()
    const animalB = await AnimalFactory.create()
    const appointmentA = await createAppointmentForAnimal(animalA.id)
    const procedureType = await ProcedureTypeFactory.create({ active: true })

    const response = await app.inject({
      method: 'POST',
      url: '/clinical-procedure.add',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        animalId: animalB.id,
        procedureTypeId: procedureType.id,
        appointmentId: appointmentA.id,
        procedureDate: new Date().toISOString(),
        description: 'Medicacao',
        actualCost: 80,
        status: 'agendado',
      },
    })

    expect(response.statusCode).toBe(409)
  })
})

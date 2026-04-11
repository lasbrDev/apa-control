import { and, eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { animalHistory, appointment } from '@/database/schema'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { AppointmentTypeFactory } from '@/tests/factories/appointment-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { VeterinaryClinicFactory } from '@/tests/factories/veterinary-clinic'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { anamnesisRoutes } from '@/http/controllers/anamnesis/routes'

describe('Anamnesis lifecycle', () => {
  const app = createBaseApp()
  let employeeId: number

  beforeAll(async () => {
    await app.register(anamnesisRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  async function createAppointmentBase() {
    const animal = await AnimalFactory.create()
    const appointmentType = await AppointmentTypeFactory.create({ active: true })
    const clinic = await VeterinaryClinicFactory.create({ active: true })

    const [createdAppointment] = await db
      .insert(appointment)
      .values({
        animalId: animal.id,
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

    return { animal, createdAppointment }
  }

  function buildRequiredAnamnesisPayload(appointmentId: number) {
    return {
      appointmentId,
      symptomsPresented: 'Vomito',
      dietaryHistory: 'Racao regular',
      behavioralHistory: 'Comportamento normal',
      requestedExams: 'Hemograma',
      presumptiveDiagnosis: 'Gastrite',
    }
  }

  it('should create/update/delete anamnesis and write animal history', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Anamnesis'] })
    const { animal, createdAppointment } = await createAppointmentBase()

    const createResponse = await app.inject({
      method: 'POST',
      url: '/anamnesis.add',
      headers: { authorization: `Bearer ${token}` },
      payload: buildRequiredAnamnesisPayload(createdAppointment.id),
    })

    expect(createResponse.statusCode).toBe(201)
    const { id } = createResponse.json<{ id: number }>()

    const [createdHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'anamnesis.created')))
    expect(createdHistory).toBeTruthy()

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/anamnesis.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id,
        ...buildRequiredAnamnesisPayload(createdAppointment.id),
        symptomsPresented: 'Vomito e apatia',
        dietaryHistory: 'Racao hipoalergenica',
      },
    })

    expect(updateResponse.statusCode).toBe(204)

    const [updatedHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'anamnesis.updated')))
    expect(updatedHistory).toBeTruthy()

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/anamnesis.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(deleteResponse.statusCode).toBe(200)

    const [deletedHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'anamnesis.deleted')))
    expect(deletedHistory).toBeTruthy()
  })

  it('should block duplicate anamnesis for same appointment', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Anamnesis'] })
    const { createdAppointment } = await createAppointmentBase()

    await app.inject({
      method: 'POST',
      url: '/anamnesis.add',
      headers: { authorization: `Bearer ${token}` },
      payload: buildRequiredAnamnesisPayload(createdAppointment.id),
    })

    const secondResponse = await app.inject({
      method: 'POST',
      url: '/anamnesis.add',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        ...buildRequiredAnamnesisPayload(createdAppointment.id),
        symptomsPresented: 'Febre',
      },
    })

    expect(secondResponse.statusCode).toBe(409)
  })
})

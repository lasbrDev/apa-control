import { and, eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { anamnesis, animalHistory } from '@/database/schema'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { AppointmentTypeFactory } from '@/tests/factories/appointment-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { VeterinaryClinicFactory } from '@/tests/factories/veterinary-clinic'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { appointmentRoutes } from '@/http/controllers/appointment/routes'

describe('Appointment lifecycle', () => {
  const app = createBaseApp()
  let employeeId: number

  beforeAll(async () => {
    await app.register(appointmentRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  it('should create/update/delete appointment and write animal history', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Appointments'] })
    const animal = await AnimalFactory.create()
    const type = await AppointmentTypeFactory.create({ active: true })
    const clinic = await VeterinaryClinicFactory.create({ active: true })

    const createResponse = await app.inject({
      method: 'POST',
      url: '/appointment.add',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        animalId: animal.id,
        appointmentTypeId: type.id,
        clinicId: clinic.id,
        appointmentDate: new Date().toISOString(),
        consultationType: 'clinica',
        status: 'agendado',
        observations: 'Primeira consulta',
      },
    })

    expect(createResponse.statusCode).toBe(201)
    const { id } = createResponse.json<{ id: number }>()
    expect(id).toEqual(expect.any(Number))

    const [createdHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'appointment.created')))
    expect(createdHistory).toBeTruthy()

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/appointment.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id,
        animalId: animal.id,
        appointmentTypeId: type.id,
        clinicId: clinic.id,
        appointmentDate: new Date(Date.now() + 3600_000).toISOString(),
        consultationType: 'clinica',
        status: 'realizado',
        observations: 'Consulta concluida',
      },
    })

    expect(updateResponse.statusCode).toBe(204)

    const [updatedHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'appointment.updated')))
    expect(updatedHistory).toBeTruthy()

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/appointment.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(deleteResponse.statusCode).toBe(200)

    const [deletedHistory] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'appointment.deleted')))
    expect(deletedHistory).toBeTruthy()
  })

  it('should block deleting appointment with linked anamnesis', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Appointments'] })
    const animal = await AnimalFactory.create()
    const type = await AppointmentTypeFactory.create({ active: true })
    const clinic = await VeterinaryClinicFactory.create({ active: true })

    const createResponse = await app.inject({
      method: 'POST',
      url: '/appointment.add',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        animalId: animal.id,
        appointmentTypeId: type.id,
        clinicId: clinic.id,
        appointmentDate: new Date().toISOString(),
        consultationType: 'clinica',
        status: 'agendado',
      },
    })

    const { id } = createResponse.json<{ id: number }>()

    await db.insert(anamnesis).values({
      appointmentId: id,
      symptomsPresented: 'Dor e febre',
      createdAt: new Date(),
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/appointment.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(409)
  })
})

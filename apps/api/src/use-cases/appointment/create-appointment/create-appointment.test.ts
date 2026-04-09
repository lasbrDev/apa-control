import { and, eq, inArray } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { anamnesis, animalHistory, appointment } from '@/database/schema'
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
    expect(createdHistory?.description).toBe(`Consulta ${type.name} registrada`)

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
    expect(updatedHistory?.description).toBe(`Consulta ${type.name} atualizada`)

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
    expect(deletedHistory?.description).toBe(`Consulta ${type.name} removida`)
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

  it('should confirm and cancel appointments in batch', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Appointments'] })
    const animal = await AnimalFactory.create()
    const type = await AppointmentTypeFactory.create({ active: true })
    const clinic = await VeterinaryClinicFactory.create({ active: true })

    async function createAppointment() {
      const response = await app.inject({
        method: 'POST',
        url: '/appointment.add',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          animalId: animal.id,
          appointmentTypeId: type.id,
          clinicId: clinic.id,
          appointmentDate: new Date().toISOString(),
          consultationType: 'clinica',
        },
      })

      return response.json<{ id: number }>().id
    }

    const confirmId1 = await createAppointment()
    const confirmId2 = await createAppointment()
    const confirmResponse = await app.inject({
      method: 'POST',
      url: '/appointment.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [confirmId1, confirmId2] },
    })
    expect(confirmResponse.statusCode).toBe(204)

    const confirmedRows = await db
      .select({ id: appointment.id, status: appointment.status })
      .from(appointment)
      .where(inArray(appointment.id, [confirmId1, confirmId2]))
    expect(confirmedRows.every((row) => row.status === 'realizado')).toBe(true)

    const cancelId1 = await createAppointment()
    const cancelId2 = await createAppointment()
    const cancelResponse = await app.inject({
      method: 'POST',
      url: '/appointment.cancel',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [cancelId1, cancelId2] },
    })
    expect(cancelResponse.statusCode).toBe(204)

    const cancelledRows = await db
      .select({ id: appointment.id, status: appointment.status })
      .from(appointment)
      .where(inArray(appointment.id, [cancelId1, cancelId2]))
    expect(cancelledRows.every((row) => row.status === 'cancelado')).toBe(true)
  })

  it('should return 409 when trying to cancel appointment that is not scheduled', async () => {
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
      },
    })
    const { id } = createResponse.json<{ id: number }>()

    await app.inject({
      method: 'POST',
      url: '/appointment.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [id] },
    })

    const cancelResponse = await app.inject({
      method: 'POST',
      url: '/appointment.cancel',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [id] },
    })

    expect(cancelResponse.statusCode).toBe(409)
  })
})

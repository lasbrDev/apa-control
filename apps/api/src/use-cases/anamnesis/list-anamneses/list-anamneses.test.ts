import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { anamnesis, appointment } from '@/database/schema'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { AppointmentTypeFactory } from '@/tests/factories/appointment-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { VeterinaryClinicFactory } from '@/tests/factories/veterinary-clinic'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { anamnesisRoutes } from '@/http/controllers/anamnesis/routes'

describe('List anamneses', () => {
  const app = createBaseApp()
  let employeeId: number
  let token: string

  beforeAll(async () => {
    await app.register(anamnesisRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Anamnesis'] })

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

    await db.insert(anamnesis).values({
      appointmentId: createdAppointment.id,
      symptomsPresented: 'Vomito e febre',
      dietaryHistory: 'Racao regular',
      behavioralHistory: null,
      requestedExams: null,
      presumptiveDiagnosis: null,
      observations: null,
      createdAt: new Date(),
    })
  })

  it('should list anamneses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/anamnesis.list?page=1&perPage=10&createdDateStart=2020-01-01&createdDateEnd=2100-12-31',
      headers: { authorization: `Bearer ${token}` },
    })

    const data = response.json()

    expect(response.statusCode).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(1)
    expect(response.headers['x-total-count']).toBeDefined()
  })

  it('should filter by animalName returning empty', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/anamnesis.list?page=1&perPage=10&createdDateStart=2020-01-01&createdDateEnd=2100-12-31&animalName=xyz-nonexistent',
      headers: { authorization: `Bearer ${token}` },
    })

    const data = response.json()

    expect(response.statusCode).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('should return 422 when createdDateStart is after createdDateEnd', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/anamnesis.list?page=1&perPage=10&createdDateStart=2100-01-01&createdDateEnd=2020-12-31',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(422)
  })

  it('should not access without role', async () => {
    const noRoleToken = getAuthToken({ id: employeeId })
    const response = await app.inject({
      method: 'GET',
      url: '/anamnesis.list',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/anamnesis.list',
    })

    expect(response.statusCode).toBe(401)
  })
})

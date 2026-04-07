import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { appointment } from '@/database/schema'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { AppointmentTypeFactory } from '@/tests/factories/appointment-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { VeterinaryClinicFactory } from '@/tests/factories/veterinary-clinic'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { appointmentRoutes } from '@/http/controllers/appointment/routes'

describe('Get appointment by id', () => {
  const app = createBaseApp()
  let employeeId: number
  let token: string

  beforeAll(async () => {
    await app.register(appointmentRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Appointments'] })
  })

  it('should get appointment by id', async () => {
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

    const response = await app.inject({
      method: 'GET',
      url: `/appointment.key/${createdAppointment.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = response.json()

    expect(response.statusCode).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data.id).toBe(createdAppointment.id)
    expect(data).toHaveProperty('animalId')
    expect(data.animalId).toBe(animal.id)
    expect(data).toHaveProperty('appointmentTypeId')
    expect(data.appointmentTypeId).toBe(appointmentType.id)
    expect(data).toHaveProperty('consultationType')
    expect(data.consultationType).toBe('clinica')
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('agendado')
  })

  it('should return 404 when appointment not found', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/appointment.key/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken({ id: employeeId })
    const response = await app.inject({
      method: 'GET',
      url: '/appointment.key/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/appointment.key/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

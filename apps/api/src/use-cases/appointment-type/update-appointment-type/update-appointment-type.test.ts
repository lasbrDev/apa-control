import { beforeAll, describe, expect, it } from 'vitest'

import { AppointmentTypeFactory } from '@/tests/factories/appointment-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { appointmentTypeRoutes } from '@/http/controllers/appointment-type/routes'

describe('Update appointment-type', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(appointmentTypeRoutes)
  })

  it('should update appointment-type', async () => {
    const appointmentType = await AppointmentTypeFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'AppointmentTypes'] })
    const updatedData = AppointmentTypeFactory.buildCreate()

    const response = await app.inject({
      method: 'PUT',
      url: '/appointment-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: appointmentType.id,
        ...updatedData,
      },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/appointment-type.key/${appointmentType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = getResponse.json()
    expect(data.name).toBe(updatedData.name)
  })

  it('should return 404 when appointment-type not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'AppointmentTypes'] })
    const updatedData = AppointmentTypeFactory.buildCreate()
    const response = await app.inject({
      method: 'PUT',
      url: '/appointment-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: 99999,
        ...updatedData,
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'PUT',
      url: '/appointment-type.update',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload: {
        id: 1,
        name: 'Test',
      },
    })

    expect(response.statusCode).toBe(403)
  })
})

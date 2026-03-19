import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { EmployeeFactory } from '@/tests/factories/employee'
import { RescueFactory } from '@/tests/factories/rescue'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { rescueRoutes } from '@/http/controllers/rescue/routes'

describe('Update rescue', () => {
  const app = createBaseApp()
  let employeeId: number

  beforeAll(async () => {
    await app.register(rescueRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  it('should update rescue', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const createPayload = RescueFactory.buildCreateWithAnimalId({ animalId: animal.id })
    const createRes = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: createPayload,
    })
    const { id } = createRes.json() as { id: number }

    const updatePayload = {
      id,
      rescueDate: createPayload.rescueDate,
      locationFound: 'Local atualizado',
      circumstances: createPayload.circumstances,
      foundConditions: createPayload.foundConditions,
      immediateProcedures: null,
      observations: null,
    }

    const response = await app.inject({
      method: 'PUT',
      url: '/rescue.update',
      headers: { authorization: `Bearer ${token}` },
      payload: updatePayload,
    })

    expect(response.statusCode).toBe(204)

    const getRes = await app.inject({
      method: 'GET',
      url: `/rescue.key/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })
    const data = getRes.json() as { locationFound: string }
    expect(data.locationFound).toBe('Local atualizado')
  })

  it('should return 404 when rescue not found', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const payload = {
      id: 99999,
      rescueDate: '2024-01-01',
      locationFound: 'Local',
      circumstances: 'Circ',
      foundConditions: 'Cond',
      immediateProcedures: null,
      observations: null,
    }

    const response = await app.inject({
      method: 'PUT',
      url: '/rescue.update',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken({ id: employeeId })
    const payload = {
      id: 1,
      rescueDate: '2024-01-01',
      locationFound: 'Local',
      circumstances: 'Circ',
      foundConditions: 'Cond',
    }

    const response = await app.inject({
      method: 'PUT',
      url: '/rescue.update',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload,
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/rescue.update',
      payload: { id: 1, rescueDate: '2024-01-01', locationFound: 'L', circumstances: 'C', foundConditions: 'C' },
    })

    expect(response.statusCode).toBe(401)
  })
})

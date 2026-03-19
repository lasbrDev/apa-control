import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { EmployeeFactory } from '@/tests/factories/employee'
import { RescueFactory } from '@/tests/factories/rescue'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { animalRoutes } from '@/http/controllers/animal/routes'
import { rescueRoutes } from '@/http/controllers/rescue/routes'

describe('Remove animal', () => {
  const app = createBaseApp()

  let employeeId: number

  beforeAll(async () => {
    await app.register(animalRoutes)
    await app.register(rescueRoutes)

    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  it('should remove animal', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Animals'] })

    const response = await app.inject({
      method: 'DELETE',
      url: `/animal.delete/${animal.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)

    // Verify it was removed
    const getResponse = await app.inject({
      method: 'GET',
      url: `/animal.key/${animal.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(getResponse.statusCode).toBe(404)
  })

  it('should return 404 when animal not found', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Animals'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/animal.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 409 when animal has rescue', async () => {
    const animal = await AnimalFactory.create()

    const rescuePayload = RescueFactory.buildCreateWithAnimalId({ animalId: animal.id })
    const rescueToken = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })

    const rescueResponse = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${rescueToken}` },
      payload: rescuePayload,
    })

    expect(rescueResponse.statusCode).toBe(201)

    const deleteToken = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Animals'] })
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/animal.delete/${animal.id}`,
      headers: { authorization: `Bearer ${deleteToken}` },
    })

    expect(deleteResponse.statusCode).toBe(409)
    const data = deleteResponse.json()
    expect(data.message).toBe(
      'Não é possível remover o animal pois ele já possui resgates ou atendimentos cadastrados.',
    )
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'DELETE',
      url: '/animal.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })
})

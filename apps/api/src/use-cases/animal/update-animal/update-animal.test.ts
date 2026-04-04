import { beforeAll, describe, expect, it } from 'vitest'

import { AnimalFactory } from '@/tests/factories/animal'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { animalRoutes } from '@/http/controllers/animal/routes'

describe('Update animal', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(animalRoutes)
  })

  it('should update animal', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Animals'] })
    const updatedData = AnimalFactory.buildCreate()

    const response = await app.inject({
      method: 'PUT',
      url: '/animal.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: animal.id,
        ...updatedData,
      },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/animal.key/${animal.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = getResponse.json()
    expect(data.name).toBe(updatedData.name)
  })

  it('should return 404 when animal not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Animals'] })
    const updatedData = AnimalFactory.buildCreate()
    const response = await app.inject({
      method: 'PUT',
      url: '/animal.update',
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
      url: '/animal.update',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload: {
        id: 1,
        name: 'Test',
      },
    })

    expect(response.statusCode).toBe(403)
  })
})

import { beforeAll, describe, expect, it } from 'vitest'

import { AdopterFactory } from '@/tests/factories/adopter'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { adopterRoutes } from '@/http/controllers/adopter/routes'

describe('Remove adopter', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(adopterRoutes)
  })

  it('should remove adopter', async () => {
    const adopter = await AdopterFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Adopters'] })

    const response = await app.inject({
      method: 'DELETE',
      url: `/adopter.delete/${adopter.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/adopter.key/${adopter.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(getResponse.statusCode).toBe(404)
  })

  it('should return 404 when adopter not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Adopters'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/adopter.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'DELETE',
      url: '/adopter.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })
})

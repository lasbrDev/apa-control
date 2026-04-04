import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { accessProfileRoutes } from '@/http/controllers/access-profile/routes'

describe('Remove access profile', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(accessProfileRoutes)
  })

  it('should remove access profile', async () => {
    const profile = await AccessProfileFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'AccessProfiles'] })

    const response = await app.inject({
      method: 'DELETE',
      url: `/profile.delete/${profile.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/profile.key/${profile.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(getResponse.statusCode).toBe(404)
  })

  it('should return 404 when profile not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'AccessProfiles'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/profile.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'DELETE',
      url: '/profile.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/profile.delete/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { ModuleFactory } from '@/tests/factories/module'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { accessProfileRoutes } from '@/http/controllers/access-profile/routes'

describe('Get access profile by id', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(accessProfileRoutes)
  })

  it('should get access profile by id', async () => {
    const module = await ModuleFactory.create()
    const profile = await AccessProfileFactory.create()

    const token = getAuthToken({ roles: ['AdminPanel', 'AccessProfiles'] })
    await app.inject({
      method: 'PUT',
      url: '/profile.update',
      headers: { authorization: `Bearer ${token}` },
      payload: { id: profile.id, description: profile.description, permissions: [module.id] },
    })

    const response = await app.inject({
      method: 'GET',
      url: `/profile.key/${profile.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = response.json()

    expect(response.statusCode).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data.id).toBe(profile.id)
    expect(data).toHaveProperty('description')
    expect(data).toHaveProperty('permissions')
    expect(Array.isArray(data.permissions)).toBe(true)
  })

  it('should return 404 when profile not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'AccessProfiles'] })
    const response = await app.inject({
      method: 'GET',
      url: '/profile.key/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'GET',
      url: '/profile.key/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profile.key/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

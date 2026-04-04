import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { ModuleFactory } from '@/tests/factories/module'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { accessProfileRoutes } from '@/http/controllers/access-profile/routes'

describe('Update access profile', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(accessProfileRoutes)
  })

  it('should update access profile', async () => {
    const module = await ModuleFactory.create()
    const profile = await AccessProfileFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'AccessProfiles'] })
    const updatedDescription = 'Perfil Atualizado'

    const response = await app.inject({
      method: 'PUT',
      url: '/profile.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: profile.id,
        description: updatedDescription,
        permissions: [module.id],
      },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/profile.key/${profile.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = getResponse.json()
    expect(data.description).toBe(updatedDescription)
    expect(data.permissions).toContain(module.id)
  })

  it('should return 404 when profile not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'AccessProfiles'] })
    const response = await app.inject({
      method: 'PUT',
      url: '/profile.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: 99999,
        description: 'Test',
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'PUT',
      url: '/profile.update',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload: {
        id: 1,
        description: 'Test',
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/profile.update',
      payload: {
        id: 1,
        description: 'Test',
      },
    })

    expect(response.statusCode).toBe(401)
  })
})

import { beforeAll, describe, expect, it } from 'vitest'

import { ProcedureTypeFactory } from '@/tests/factories/procedure-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { procedureTypeRoutes } from '@/http/controllers/procedure-type/routes'

describe('Remove procedure-type', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(procedureTypeRoutes)
  })

  it('should remove procedure-type', async () => {
    const procedureType = await ProcedureTypeFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'ProcedureTypes'] })

    const response = await app.inject({
      method: 'DELETE',
      url: `/procedure-type.delete/${procedureType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/procedure-type.key/${procedureType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(getResponse.statusCode).toBe(404)
  })

  it('should return 404 when procedure-type not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'ProcedureTypes'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/procedure-type.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'DELETE',
      url: '/procedure-type.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })
})

import { beforeAll, describe, expect, it } from 'vitest'

import { FinalDestinationTypeFactory } from '@/tests/factories/final-destination-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { finalDestinationTypeRoutes } from '@/http/controllers/final-destination-type/routes'

describe('Update final-destination-type', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(finalDestinationTypeRoutes)
  })

  it('should update final-destination-type', async () => {
    const finalDestinationType = await FinalDestinationTypeFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'FinalDestinationTypes'] })
    const updatedData = FinalDestinationTypeFactory.buildCreate()

    const response = await app.inject({
      method: 'PUT',
      url: '/final-destination-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: finalDestinationType.id,
        ...updatedData,
      },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/final-destination-type.key/${finalDestinationType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = getResponse.json()
    expect(data.name).toBe(updatedData.name)
  })

  it('should return 404 when final-destination-type not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'FinalDestinationTypes'] })
    const response = await app.inject({
      method: 'PUT',
      url: '/final-destination-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: 99999,
        ...FinalDestinationTypeFactory.buildCreate(),
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'PUT',
      url: '/final-destination-type.update',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload: {
        id: 99999,
        ...FinalDestinationTypeFactory.buildCreate(),
      },
    })

    expect(response.statusCode).toBe(403)
  })
})

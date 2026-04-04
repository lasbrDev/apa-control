import { beforeAll, describe, expect, it } from 'vitest'

import { CampaignTypeFactory } from '@/tests/factories/campaign-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { campaignTypeRoutes } from '@/http/controllers/campaign-type/routes'

describe('Update campaign-type', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(campaignTypeRoutes)
  })

  it('should update campaign-type', async () => {
    const campaignType = await CampaignTypeFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'CampaignTypes'] })
    const updatedData = CampaignTypeFactory.buildCreate()

    const response = await app.inject({
      method: 'PUT',
      url: '/campaign-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: campaignType.id,
        ...updatedData,
      },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/campaign-type.key/${campaignType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = getResponse.json()
    expect(data.name).toBe(updatedData.name)
  })

  it('should return 404 when campaign-type not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'CampaignTypes'] })
    const response = await app.inject({
      method: 'PUT',
      url: '/campaign-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: 99999,
        ...CampaignTypeFactory.buildCreate(),
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'PUT',
      url: '/campaign-type.update',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload: {
        id: 99999,
        ...CampaignTypeFactory.buildCreate(),
      },
    })

    expect(response.statusCode).toBe(403)
  })
})

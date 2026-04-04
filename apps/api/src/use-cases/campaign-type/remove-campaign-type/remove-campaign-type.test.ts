import { beforeAll, describe, expect, it } from 'vitest'

import { CampaignTypeFactory } from '@/tests/factories/campaign-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { campaignTypeRoutes } from '@/http/controllers/campaign-type/routes'

describe('Remove campaign-type', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(campaignTypeRoutes)
  })

  it('should remove campaign-type', async () => {
    const campaignType = await CampaignTypeFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'CampaignTypes'] })

    const response = await app.inject({
      method: 'DELETE',
      url: `/campaign-type.delete/${campaignType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/campaign-type.key/${campaignType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(getResponse.statusCode).toBe(404)
  })

  it('should return 404 when campaign-type not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'CampaignTypes'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/campaign-type.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'DELETE',
      url: '/campaign-type.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })
})

import { beforeAll, describe, expect, it } from 'vitest'

import { campaignRoutes } from '@/http/controllers/campaign/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { CampaignFactory } from '@/tests/factories/campaign'
import { CampaignTypeFactory } from '@/tests/factories/campaign-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Complete campaign', () => {
  const app = createBaseApp()
  let employeeId: number
  let campaignTypeId: number
  let token: string

  beforeAll(async () => {
    await app.register(campaignRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Campaigns'] })
    const campaignType = await CampaignTypeFactory.create()
    campaignTypeId = campaignType.id
  })

  async function createCampaign() {
    const res = await app.inject({
      method: 'POST',
      url: '/campaign.add',
      headers: { authorization: `Bearer ${token}` },
      payload: CampaignFactory.buildCreate({ campaignTypeId }),
    })
    return res.json().id as number
  }

  it('should complete active campaign successfully', async () => {
    const id = await createCampaign()

    const response = await app.inject({
      method: 'POST',
      url: `/campaign.complete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)
  })

  it('should return 400 when campaign is not active', async () => {
    const id = await createCampaign()

    await app.inject({
      method: 'POST',
      url: `/campaign.complete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const response = await app.inject({
      method: 'POST',
      url: `/campaign.complete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 404 when campaign does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/campaign.complete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/campaign.complete/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

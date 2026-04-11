import FormData from 'form-data'
import { beforeAll, describe, expect, it } from 'vitest'

import { campaignRoutes } from '@/http/controllers/campaign/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { CampaignFactory } from '@/tests/factories/campaign'
import { CampaignTypeFactory } from '@/tests/factories/campaign-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Update campaign', () => {
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

  it('should update campaign successfully', async () => {
    const id = await createCampaign()

    const response = await app.inject({
      method: 'PUT',
      url: '/campaign.update',
      headers: { authorization: `Bearer ${token}` },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: CampaignFactory.buildCreate({ id, campaignTypeId } as any),
    })

    expect(response.statusCode).toBe(204)
  })

  it('should upload proof file when updating campaign', async () => {
    const id = await createCampaign()
    const payload = CampaignFactory.buildCreate({ campaignTypeId })
    const formData = new FormData()

    formData.append('id', String(id))
    formData.append('campaignTypeId', String(payload.campaignTypeId))
    formData.append('title', payload.title)
    formData.append('description', payload.description)
    formData.append('startDate', payload.startDate)
    formData.append('endDate', payload.endDate)
    if (payload.fundraisingGoal != null) formData.append('fundraisingGoal', String(payload.fundraisingGoal))
    if (payload.observations) formData.append('observations', payload.observations)
    formData.append('proofFile', Buffer.from('campaign-proof-update'), { filename: 'campaign-proof-update.txt' })

    const updateResponse = await app.inject({
      method: 'PUT',
      url: '/campaign.update',
      headers: { authorization: `Bearer ${token}`, ...formData.getHeaders() },
      payload: formData.getBuffer(),
    })

    const keyResponse = await app.inject({
      method: 'GET',
      url: `/campaign.key/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(updateResponse.statusCode).toBe(204)
    expect(keyResponse.statusCode).toBe(200)
    expect(keyResponse.json().proof).toMatch(/^(\/uploads\/campaign\/|https?:\/\/)/)

    await app.inject({
      method: 'DELETE',
      url: `/campaign.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })
  })

  it('should return 404 when campaign does not exist', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/campaign.update',
      headers: { authorization: `Bearer ${token}` },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: CampaignFactory.buildCreate({ id: 99999, campaignTypeId } as any),
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 404 when campaign type does not exist', async () => {
    const id = await createCampaign()

    const response = await app.inject({
      method: 'PUT',
      url: '/campaign.update',
      headers: { authorization: `Bearer ${token}` },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: CampaignFactory.buildCreate({ id, campaignTypeId: 99999 } as any),
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/campaign.update',
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: CampaignFactory.buildCreate({ id: 1, campaignTypeId } as any),
    })

    expect(response.statusCode).toBe(401)
  })
})

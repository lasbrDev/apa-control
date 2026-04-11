import FormData from 'form-data'
import { beforeAll, describe, expect, it } from 'vitest'

import { campaignRoutes } from '@/http/controllers/campaign/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { CampaignFactory } from '@/tests/factories/campaign'
import { CampaignTypeFactory } from '@/tests/factories/campaign-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Create campaign', () => {
  const app = createBaseApp()
  let employeeId: number
  let campaignTypeId: number

  beforeAll(async () => {
    await app.register(campaignRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    const campaignType = await CampaignTypeFactory.create()
    campaignTypeId = campaignType.id
  })

  it('should create campaign successfully', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Campaigns'] })
    const payload = CampaignFactory.buildCreate({ campaignTypeId })

    const response = await app.inject({
      method: 'POST',
      url: '/campaign.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    const data = response.json()
    expect(response.statusCode).toBe(201)
    expect(data).toHaveProperty('id')
    expect(typeof data.id).toBe('number')
  })

  it('should upload proof file when creating campaign', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Campaigns'] })
    const payload = CampaignFactory.buildCreate({ campaignTypeId })
    const formData = new FormData()

    formData.append('campaignTypeId', String(payload.campaignTypeId))
    formData.append('title', payload.title)
    formData.append('description', payload.description)
    formData.append('startDate', payload.startDate)
    formData.append('endDate', payload.endDate)
    if (payload.fundraisingGoal != null) formData.append('fundraisingGoal', String(payload.fundraisingGoal))
    if (payload.observations) formData.append('observations', payload.observations)
    formData.append('proofFile', Buffer.from('campaign-proof'), { filename: 'campaign-proof.txt' })

    const createResponse = await app.inject({
      method: 'POST',
      url: '/campaign.add',
      headers: { authorization: `Bearer ${token}`, ...formData.getHeaders() },
      payload: formData.getBuffer(),
    })

    const { id } = createResponse.json()

    const keyResponse = await app.inject({
      method: 'GET',
      url: `/campaign.key/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(createResponse.statusCode).toBe(201)
    expect(keyResponse.statusCode).toBe(200)
    expect(keyResponse.json().proof).toMatch(/^(\/uploads\/campaign\/|https?:\/\/)/)

    await app.inject({
      method: 'DELETE',
      url: `/campaign.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })
  })

  it('should return 404 when campaign type does not exist', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Campaigns'] })
    const payload = CampaignFactory.buildCreate({ campaignTypeId: 99999 })

    const response = await app.inject({
      method: 'POST',
      url: '/campaign.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 400 when startDate is after endDate', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Campaigns'] })
    const payload = CampaignFactory.buildCreate({
      campaignTypeId,
      startDate: '2100-01-01',
      endDate: '2020-01-01',
    })

    const response = await app.inject({
      method: 'POST',
      url: '/campaign.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(response.statusCode).toBe(422)
  })

  it('should not access without role', async () => {
    const token = getAuthToken({ id: employeeId })
    const payload = CampaignFactory.buildCreate({ campaignTypeId })

    const response = await app.inject({
      method: 'POST',
      url: '/campaign.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/campaign.add',
      payload: CampaignFactory.buildCreate({ campaignTypeId }),
    })

    expect(response.statusCode).toBe(401)
  })
})

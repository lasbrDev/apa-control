import { Decimal } from 'decimal.js'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { financialTransaction } from '@/database/schema'
import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import { TransactionStatus } from '@/database/schema/enums/transaction-status'
import { campaignRoutes } from '@/http/controllers/campaign/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { CampaignFactory } from '@/tests/factories/campaign'
import { CampaignTypeFactory } from '@/tests/factories/campaign-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { TransactionTypeFactory } from '@/tests/factories/transaction-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Remove campaign', () => {
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

  it('should remove campaign successfully', async () => {
    const id = await createCampaign()

    const response = await app.inject({
      method: 'DELETE',
      url: `/campaign.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
  })

  it('should return 404 when campaign does not exist', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/campaign.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 409 when campaign has linked expenses', async () => {
    const campaignId = await createCampaign()
    const transactionType = await TransactionTypeFactory.create({ category: TransactionCategory.EXPENSE })

    await db.insert(financialTransaction).values({
      transactionTypeId: transactionType.id,
      campaignId,
      animalId: null,
      employeeId,
      description: 'Despesa vinculada à campanha',
      value: new Decimal(100),
      proof: null,
      observations: null,
      status: TransactionStatus.PENDING,
      paymentDate: null,
      createdAt: new Date(),
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/campaign.delete/${campaignId}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().message).toBe('Não é possível remover a campanha, pois ela possui despesas vinculadas.')
  })

  it('should return 409 when campaign has linked revenues', async () => {
    const campaignId = await createCampaign()
    const transactionType = await TransactionTypeFactory.create({ category: TransactionCategory.INCOME })

    await db.insert(financialTransaction).values({
      transactionTypeId: transactionType.id,
      campaignId,
      animalId: null,
      employeeId,
      description: 'Receita vinculada à campanha',
      value: new Decimal(150),
      proof: null,
      observations: null,
      status: TransactionStatus.PENDING,
      paymentDate: null,
      createdAt: new Date(),
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/campaign.delete/${campaignId}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().message).toBe('Não é possível remover a campanha, pois ela possui receitas vinculadas.')
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/campaign.delete/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

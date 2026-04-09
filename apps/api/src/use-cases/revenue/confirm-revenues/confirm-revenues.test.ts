import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { financialTransaction } from '@/database/schema'
import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import { revenueRoutes } from '@/http/controllers/revenue/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { EmployeeFactory } from '@/tests/factories/employee'
import { RevenueFactory } from '@/tests/factories/revenue'
import { TransactionTypeFactory } from '@/tests/factories/transaction-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Confirm revenues (batch)', () => {
  const app = createBaseApp()
  let employeeId: number
  let incomeTypeId: number
  let token: string

  beforeAll(async () => {
    await app.register(revenueRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Revenues'] })
    const transactionType = await TransactionTypeFactory.create({ category: TransactionCategory.INCOME })
    incomeTypeId = transactionType.id
  })

  async function createRevenue() {
    const res = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: incomeTypeId }),
    })
    return res.json().id as number
  }

  async function reverseRevenue(id: number) {
    await app.inject({
      method: 'POST',
      url: '/revenue.reverse',
      headers: { authorization: `Bearer ${token}` },
      payload: { id },
    })
  }

  it('should confirm multiple revenues', async () => {
    const id1 = await createRevenue()
    const id2 = await createRevenue()
    await reverseRevenue(id1)
    await reverseRevenue(id2)

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [id1, id2] },
    })

    expect(response.statusCode).toBe(204)

    const [transaction] = await db
      .select({
        status: financialTransaction.status,
        paymentDate: financialTransaction.paymentDate,
        reversalDate: financialTransaction.reversalDate,
      })
      .from(financialTransaction)
      .where(eq(financialTransaction.id, id1))

    expect(transaction?.status).toBe('confirmado')
    expect(transaction?.paymentDate).toBeTruthy()
    expect(transaction?.reversalDate).toBeNull()
  })

  it('should return 409 when trying to confirm non-reversed revenue', async () => {
    const id = await createRevenue()

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [id] },
    })

    expect(response.statusCode).toBe(409)
  })

  it('should return 422 when ids is empty', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/revenue.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [] },
    })

    expect(response.statusCode).toBe(422)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/revenue.confirm',
      payload: { ids: [1] },
    })

    expect(response.statusCode).toBe(401)
  })
})

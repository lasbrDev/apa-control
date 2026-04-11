import { beforeAll, describe, expect, it } from 'vitest'

import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import { revenueRoutes } from '@/http/controllers/revenue/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { EmployeeFactory } from '@/tests/factories/employee'
import { RevenueFactory } from '@/tests/factories/revenue'
import { TransactionTypeFactory } from '@/tests/factories/transaction-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Update revenue', () => {
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

  it('should update revenue successfully', async () => {
    const id = await createRevenue()
    await reverseRevenue(id)

    const response = await app.inject({
      method: 'PUT',
      url: '/revenue.update',
      headers: { authorization: `Bearer ${token}` },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: RevenueFactory.buildCreate({ id, transactionTypeId: incomeTypeId } as any),
    })

    expect(response.statusCode).toBe(204)
  })

  it('should return 404 when revenue does not exist', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/revenue.update',
      headers: { authorization: `Bearer ${token}` },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: RevenueFactory.buildCreate({ id: 99999, transactionTypeId: incomeTypeId } as any),
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 404 when transaction type does not exist', async () => {
    const id = await createRevenue()
    await reverseRevenue(id)

    const response = await app.inject({
      method: 'PUT',
      url: '/revenue.update',
      headers: { authorization: `Bearer ${token}` },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: RevenueFactory.buildCreate({ id, transactionTypeId: 99999 } as any),
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/revenue.update',
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      payload: RevenueFactory.buildCreate({ id: 1, transactionTypeId: incomeTypeId } as any),
    })

    expect(response.statusCode).toBe(401)
  })
})

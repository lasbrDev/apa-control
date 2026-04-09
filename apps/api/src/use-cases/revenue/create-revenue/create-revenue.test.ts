import { and, eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { animalHistory } from '@/database/schema'
import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import { revenueRoutes } from '@/http/controllers/revenue/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { EmployeeFactory } from '@/tests/factories/employee'
import { RevenueFactory } from '@/tests/factories/revenue'
import { TransactionTypeFactory } from '@/tests/factories/transaction-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Create revenue', () => {
  const app = createBaseApp()
  let employeeId: number
  let incomeTypeId: number

  beforeAll(async () => {
    await app.register(revenueRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    const transactionType = await TransactionTypeFactory.create({ category: TransactionCategory.INCOME })
    incomeTypeId = transactionType.id
  })

  it('should create revenue successfully', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Revenues'] })

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: incomeTypeId }),
    })

    const data = response.json()
    expect(response.statusCode).toBe(201)
    expect(data).toHaveProperty('id')
    expect(typeof data.id).toBe('number')
  })

  it('should create animal history when creating revenue with animal', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Revenues'] })
    const animal = await AnimalFactory.create()

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: incomeTypeId, animalId: animal.id }),
    })

    expect(response.statusCode).toBe(201)

    const [history] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'revenue.created')))

    expect(history).toBeTruthy()
  })

  it('should return 404 when transaction type does not exist', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Revenues'] })

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: 99999 }),
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 400 when transaction type is not income category', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Revenues'] })
    const expenseType = await TransactionTypeFactory.create({ category: TransactionCategory.EXPENSE })

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: expenseType.id }),
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return 409 when transaction type is inactive', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Revenues'] })
    const inactiveType = await TransactionTypeFactory.create({ category: TransactionCategory.INCOME, active: false })

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: inactiveType.id }),
    })

    expect(response.statusCode).toBe(409)
  })

  it('should not access without role', async () => {
    const token = getAuthToken({ id: employeeId })

    const response = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: incomeTypeId }),
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      payload: RevenueFactory.buildCreate({ transactionTypeId: incomeTypeId }),
    })

    expect(response.statusCode).toBe(401)
  })
})

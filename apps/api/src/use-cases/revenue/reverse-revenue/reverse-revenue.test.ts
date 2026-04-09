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

describe('Reverse revenue', () => {
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

  it('should reverse revenue and write animal history', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Revenues'] })
    const animal = await AnimalFactory.create()

    const createResponse = await app.inject({
      method: 'POST',
      url: '/revenue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: RevenueFactory.buildCreate({ transactionTypeId: incomeTypeId, animalId: animal.id }),
    })

    expect(createResponse.statusCode).toBe(201)
    const { id } = createResponse.json<{ id: number }>()

    const reverseResponse = await app.inject({
      method: 'POST',
      url: '/revenue.reverse',
      headers: { authorization: `Bearer ${token}` },
      payload: { id },
    })

    expect(reverseResponse.statusCode).toBe(204)

    const [history] = await db
      .select()
      .from(animalHistory)
      .where(and(eq(animalHistory.animalId, animal.id), eq(animalHistory.action, 'revenue.reversed')))

    expect(history).toBeTruthy()
  })
})

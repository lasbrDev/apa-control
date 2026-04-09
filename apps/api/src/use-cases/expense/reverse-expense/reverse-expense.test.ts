import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { financialTransaction } from '@/database/schema'
import { TransactionCategory } from '@/database/schema/enums/transaction-category'
import { expenseRoutes } from '@/http/controllers/expense/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { EmployeeFactory } from '@/tests/factories/employee'
import { ExpenseFactory } from '@/tests/factories/expense'
import { TransactionTypeFactory } from '@/tests/factories/transaction-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

describe('Reverse expense', () => {
  const app = createBaseApp()
  let employeeId: number
  let expenseTypeId: number
  let token: string

  beforeAll(async () => {
    await app.register(expenseRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Financial', 'Expenses'] })
    const transactionType = await TransactionTypeFactory.create({ category: TransactionCategory.EXPENSE })
    expenseTypeId = transactionType.id
  })

  it('should reverse expense and clear payment date', async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/expense.add',
      headers: { authorization: `Bearer ${token}` },
      payload: ExpenseFactory.buildCreate({ transactionTypeId: expenseTypeId }),
    })

    expect(createResponse.statusCode).toBe(201)
    const { id } = createResponse.json<{ id: number }>()

    const confirmResponse = await app.inject({
      method: 'POST',
      url: '/expense.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [id] },
    })

    expect(confirmResponse.statusCode).toBe(204)

    const reverseResponse = await app.inject({
      method: 'POST',
      url: '/expense.reverse',
      headers: { authorization: `Bearer ${token}` },
      payload: { id },
    })

    expect(reverseResponse.statusCode).toBe(204)

    const [transaction] = await db
      .select({
        status: financialTransaction.status,
        paymentDate: financialTransaction.paymentDate,
        reversalDate: financialTransaction.reversalDate,
      })
      .from(financialTransaction)
      .where(eq(financialTransaction.id, id))

    expect(transaction?.status).toBe('estornado')
    expect(transaction?.paymentDate).toBeNull()
    expect(transaction?.reversalDate).toBeTruthy()
  })
})

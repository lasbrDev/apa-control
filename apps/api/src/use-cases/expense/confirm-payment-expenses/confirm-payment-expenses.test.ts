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

describe('Confirm payment expenses (batch)', () => {
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

  async function createExpense() {
    const res = await app.inject({
      method: 'POST',
      url: '/expense.add',
      headers: { authorization: `Bearer ${token}` },
      payload: ExpenseFactory.buildCreate({ transactionTypeId: expenseTypeId }),
    })
    return res.json().id as number
  }

  async function reverseExpense(id: number) {
    await app.inject({
      method: 'POST',
      url: '/expense.reverse',
      headers: { authorization: `Bearer ${token}` },
      payload: { id },
    })
  }

  it('should confirm payment for multiple expenses', async () => {
    const id1 = await createExpense()
    const id2 = await createExpense()
    await app.inject({
      method: 'POST',
      url: '/expense.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [id1, id2] },
    })
    await reverseExpense(id1)
    await reverseExpense(id2)

    const response = await app.inject({
      method: 'POST',
      url: '/expense.confirm',
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

  it('should return 422 when ids is empty', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/expense.confirm',
      headers: { authorization: `Bearer ${token}` },
      payload: { ids: [] },
    })

    expect(response.statusCode).toBe(422)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/expense.confirm',
      payload: { ids: [1] },
    })

    expect(response.statusCode).toBe(401)
  })
})

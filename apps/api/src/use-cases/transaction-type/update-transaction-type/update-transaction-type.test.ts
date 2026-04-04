import { beforeAll, describe, expect, it } from 'vitest'

import { TransactionTypeFactory } from '@/tests/factories/transaction-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { transactionTypeRoutes } from '@/http/controllers/transaction-type/routes'

describe('Update transaction-type', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(transactionTypeRoutes)
  })

  it('should update transaction-type', async () => {
    const transactionType = await TransactionTypeFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'TransactionTypes'] })
    const updatedData = TransactionTypeFactory.buildCreate()

    const response = await app.inject({
      method: 'PUT',
      url: '/transaction-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: transactionType.id,
        ...updatedData,
      },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/transaction-type.key/${transactionType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = getResponse.json()
    expect(data.name).toBe(updatedData.name)
  })

  it('should return 404 when transaction-type not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'TransactionTypes'] })
    const response = await app.inject({
      method: 'PUT',
      url: '/transaction-type.update',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        id: 99999,
        ...TransactionTypeFactory.buildCreate(),
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'PUT',
      url: '/transaction-type.update',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload: {
        id: 99999,
        ...TransactionTypeFactory.buildCreate(),
      },
    })

    expect(response.statusCode).toBe(403)
  })
})

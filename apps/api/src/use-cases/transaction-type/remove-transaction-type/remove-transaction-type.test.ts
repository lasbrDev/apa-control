import { beforeAll, describe, expect, it } from 'vitest'

import { TransactionTypeFactory } from '@/tests/factories/transaction-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { transactionTypeRoutes } from '@/http/controllers/transaction-type/routes'

describe('Remove transaction-type', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(transactionTypeRoutes)
  })

  it('should remove transaction-type', async () => {
    const transactionType = await TransactionTypeFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'TransactionTypes'] })

    const response = await app.inject({
      method: 'DELETE',
      url: `/transaction-type.delete/${transactionType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/transaction-type.key/${transactionType.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(getResponse.statusCode).toBe(404)
  })

  it('should return 404 when transaction-type not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'TransactionTypes'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/transaction-type.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'DELETE',
      url: '/transaction-type.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })
})

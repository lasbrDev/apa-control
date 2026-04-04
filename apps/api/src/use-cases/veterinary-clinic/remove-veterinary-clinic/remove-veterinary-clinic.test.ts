import { beforeAll, describe, expect, it } from 'vitest'

import { VeterinaryClinicFactory } from '@/tests/factories/veterinary-clinic'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { veterinaryClinicRoutes } from '@/http/controllers/veterinary-clinic/routes'

describe('Remove veterinary-clinic', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(veterinaryClinicRoutes)
  })

  it('should remove veterinary-clinic', async () => {
    const veterinaryClinic = await VeterinaryClinicFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'VeterinaryClinics'] })

    const response = await app.inject({
      method: 'DELETE',
      url: `/veterinary-clinic.delete/${veterinaryClinic.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(204)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/veterinary-clinic.key/${veterinaryClinic.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(getResponse.statusCode).toBe(404)
  })

  it('should return 404 when veterinary-clinic not found', async () => {
    const token = getAuthToken({ roles: ['AdminPanel', 'Registrations', 'VeterinaryClinics'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/veterinary-clinic.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'DELETE',
      url: '/veterinary-clinic.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })
})

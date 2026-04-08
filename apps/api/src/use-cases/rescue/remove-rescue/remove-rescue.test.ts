import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { EmployeeFactory } from '@/tests/factories/employee'
import { FinalDestinationFactory } from '@/tests/factories/final-destination'
import { FinalDestinationTypeFactory } from '@/tests/factories/final-destination-type'
import { RescueFactory } from '@/tests/factories/rescue'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { rescueRoutes } from '@/http/controllers/rescue/routes'

describe('Remove rescue', () => {
  const app = createBaseApp()
  let employeeId: number
  let destinationTypeId: number

  beforeAll(async () => {
    await app.register(rescueRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    const destinationType = await FinalDestinationTypeFactory.create()
    destinationTypeId = destinationType.id
  })

  it('should remove rescue', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const createPayload = RescueFactory.buildCreateWithAnimalId({ animalId: animal.id })
    const createRes = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: createPayload,
    })
    const { id } = createRes.json() as { id: number }

    const response = await app.inject({
      method: 'DELETE',
      url: `/rescue.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)

    const getRes = await app.inject({
      method: 'GET',
      url: `/rescue.key/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(getRes.statusCode).toBe(404)
  })

  it('should return 404 when rescue not found', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const response = await app.inject({
      method: 'DELETE',
      url: '/rescue.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 409 when animal has linked final destination', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const createPayload = RescueFactory.buildCreateWithAnimalId({ animalId: animal.id })
    const createRes = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: createPayload,
    })
    const { id } = createRes.json() as { id: number }

    await FinalDestinationFactory.create({
      animalId: animal.id,
      destinationTypeId,
      employeeId,
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/rescue.delete/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(409)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken({ id: employeeId })
    const response = await app.inject({
      method: 'DELETE',
      url: '/rescue.delete/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/rescue.delete/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

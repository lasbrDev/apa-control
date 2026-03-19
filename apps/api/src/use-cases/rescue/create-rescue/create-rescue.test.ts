import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { EmployeeFactory } from '@/tests/factories/employee'
import { RescueFactory } from '@/tests/factories/rescue'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { rescueRoutes } from '@/http/controllers/rescue/routes'

describe('Create rescue', () => {
  const app = createBaseApp()
  let employeeId: number

  beforeAll(async () => {
    await app.register(rescueRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  it('should create rescue with existing animal (animalId)', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const payload = RescueFactory.buildCreateWithAnimalId({ animalId: animal.id })

    const response = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    const data = response.json()

    expect(response.statusCode).toBe(201)
    expect(data).toHaveProperty('id')
    expect(typeof data.id).toBe('number')
  })

  it('should create rescue with new animal (animal)', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const payload = RescueFactory.buildCreateWithAnimal()

    const response = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    const data = response.json()

    expect(response.statusCode).toBe(201)
    expect(data).toHaveProperty('id')
    expect(typeof data.id).toBe('number')
  })

  it('should reject when both animalId and animal are sent (XOR)', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const withAnimal = RescueFactory.buildCreateWithAnimal()
    const payload = { ...withAnimal, animalId: animal.id }

    const response = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(response.statusCode).toBe(422)
    const data = response.json()
    expect(data.message).toBeDefined()
  })

  it('should reject when neither animalId nor animal is sent', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const payload = RescueFactory.buildCreateWithAnimalId()
    const { animalId: _, ...payloadWithoutAnimal } = payload

    const response = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload: payloadWithoutAnimal,
    })

    expect(response.statusCode).toBe(422)
  })

  it('should return 404 when animalId does not exist', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const payload = RescueFactory.buildCreateWithAnimalId({ animalId: 99999 })

    const response = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken({ id: employeeId })
    const payload = RescueFactory.buildCreateWithAnimalId()

    const response = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload,
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const payload = RescueFactory.buildCreateWithAnimalId()

    const response = await app.inject({
      method: 'POST',
      url: '/rescue.add',
      payload,
    })

    expect(response.statusCode).toBe(401)
  })
})

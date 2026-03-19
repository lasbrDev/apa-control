import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { EmployeeFactory } from '@/tests/factories/employee'
import { RescueFactory } from '@/tests/factories/rescue'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { rescueRoutes } from '@/http/controllers/rescue/routes'

describe('List rescues', () => {
  const app = createBaseApp()
  let employeeId: number

  beforeAll(async () => {
    await app.register(rescueRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  it('should list rescues with query params (queryString pattern)', async () => {
    const animal = await AnimalFactory.create()
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const payload = RescueFactory.buildCreateWithAnimalId({ animalId: animal.id })
    await app.inject({
      method: 'POST',
      url: '/rescue.add',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    const listResponse = await app.inject({
      method: 'GET',
      url: '/rescue.list?page=1&perPage=10&sort=rescueDate&fields=id,animalId,rescueDate,locationFound,animalName&rescueDateStart=2020-01-01&rescueDateEnd=2100-12-31',
      headers: { authorization: `Bearer ${token}` },
    })

    const data = listResponse.json()
    const totalCount = listResponse.headers['x-total-count']

    expect(listResponse.statusCode).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(1)
    expect(totalCount).toBeDefined()
  })

  it('should filter by animalName and locationFound', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'Rescues'] })
    const response = await app.inject({
      method: 'GET',
      url: '/rescue.list?page=1&perPage=10&animalName=xyz-nonexistent&locationFound=xyz-nonexistent&rescueDateStart=2020-01-01&rescueDateEnd=2100-12-31',
      headers: { authorization: `Bearer ${token}` },
    })

    const data = response.json()
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken({ id: employeeId })
    const response = await app.inject({
      method: 'GET',
      url: '/rescue.list',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/rescue.list',
    })

    expect(response.statusCode).toBe(401)
  })
})

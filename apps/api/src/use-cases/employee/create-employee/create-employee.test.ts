import { beforeAll, describe, expect, it } from 'vitest'

import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { EmployeeFactory } from '@/tests/factories/employee'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'

import { employeeRoutes } from '@/http/controllers/employee/routes'

describe('Create employee', () => {
  const app = createBaseApp()

  beforeAll(async () => {
    await app.register(employeeRoutes)
  })

  it('should create an employee', async () => {
    const profile = await AccessProfileFactory.create()
    const token = getAuthToken({ roles: ['AdminPanel', 'Employees'] })
    const employee = EmployeeFactory.buildCreate({
      profileId: profile.id,
      name: 'Funcionario Teste',
      login: `teste${Date.now()}`,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/employee.add',
      headers: { authorization: `Bearer ${token}` },
      payload: employee,
    })

    const data = response.json()

    expect(response.statusCode).toBe(201)
    expect(data).toHaveProperty('id')
    expect(typeof data.id).toBe('number')
  })

  it('should not create employee with duplicate login', async () => {
    const profile = await AccessProfileFactory.create()
    const uniqueLogin = `testuser${Date.now()}`
    const existingEmployee = await EmployeeFactory.create({ profileId: profile.id, login: uniqueLogin })
    const token = getAuthToken({ roles: ['AdminPanel', 'Employees'] })
    const newEmployee = EmployeeFactory.buildCreate({
      profileId: profile.id,
      login: uniqueLogin,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/employee.add',
      headers: { authorization: `Bearer ${token}` },
      payload: newEmployee,
    })

    expect(response.statusCode).toBe(409)
    const data = response.json()
    expect(data.message).toContain('login')
  })

  it('should not create employee with duplicate CPF', async () => {
    const profile = await AccessProfileFactory.create()
    const existingEmployee = await EmployeeFactory.create({ profileId: profile.id })
    const token = getAuthToken({ roles: ['AdminPanel', 'Employees'] })
    const newEmployee = EmployeeFactory.buildCreate({
      profileId: profile.id,
      cpf: existingEmployee.cpf,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/employee.add',
      headers: { authorization: `Bearer ${token}` },
      payload: newEmployee,
    })

    expect(response.statusCode).toBe(409)
    const data = response.json()
    expect(data.message).toContain('CPF')
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken()
    const response = await app.inject({
      method: 'POST',
      url: '/employee.add',
      headers: { authorization: `Bearer ${noRoleToken}` },
      payload: {},
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/employee.add',
      payload: {},
    })

    expect(response.statusCode).toBe(401)
  })
})

import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { animal, rescue } from '@/database/schema'
import { finalDestinationRoutes } from '@/http/controllers/final-destination/routes'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { EmployeeFactory } from '@/tests/factories/employee'
import { FinalDestinationFactory } from '@/tests/factories/final-destination'
import { FinalDestinationTypeFactory } from '@/tests/factories/final-destination-type'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'
import { eq } from 'drizzle-orm'

describe('Remove final-destination', () => {
  const app = createBaseApp()
  let employeeId: number

  beforeAll(async () => {
    await app.register(finalDestinationRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
  })

  it('should set animal status to active when removing final-destination and rescue exists', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'FinalDestinations'] })
    const createdAnimal = await AnimalFactory.create({ status: 'inativo', rescueAt: new Date() })
    const destinationType = await FinalDestinationTypeFactory.create()

    await db.insert(rescue).values({
      animalId: createdAnimal.id,
      employeeId,
      rescueDate: new Date(),
      locationFound: 'Rua Teste, 123',
      circumstances: 'Circunstâncias do resgate',
      foundConditions: 'Condição encontrada',
      immediateProcedures: null,
      observations: null,
      createdAt: new Date(),
    })

    const created = await FinalDestinationFactory.create({
      animalId: createdAnimal.id,
      destinationTypeId: destinationType.id,
      employeeId,
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/final-destination.delete/${created.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)

    const [updatedAnimal] = await db
      .select({ status: animal.status, rescueAt: animal.rescueAt })
      .from(animal)
      .where(eq(animal.id, createdAnimal.id))

    expect(updatedAnimal!.status).toBe('ativo')
    expect(updatedAnimal!.rescueAt).not.toBeNull()
  })

  it('should set animal status to pending when removing final-destination and rescue does not exist', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'FinalDestinations'] })
    const createdAnimal = await AnimalFactory.create({ status: 'inativo', rescueAt: null })
    const destinationType = await FinalDestinationTypeFactory.create()
    const created = await FinalDestinationFactory.create({
      animalId: createdAnimal.id,
      destinationTypeId: destinationType.id,
      employeeId,
    })

    const response = await app.inject({
      method: 'DELETE',
      url: `/final-destination.delete/${created.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)

    const [updatedAnimal] = await db
      .select({ status: animal.status, rescueAt: animal.rescueAt })
      .from(animal)
      .where(eq(animal.id, createdAnimal.id))

    expect(updatedAnimal!.status).toBe('pendente')
    expect(updatedAnimal!.rescueAt).toBeNull()
  })

  it('should return 404 when final-destination does not exist', async () => {
    const token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'FinalDestinations'] })

    const response = await app.inject({
      method: 'DELETE',
      url: '/final-destination.delete/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/final-destination.delete/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

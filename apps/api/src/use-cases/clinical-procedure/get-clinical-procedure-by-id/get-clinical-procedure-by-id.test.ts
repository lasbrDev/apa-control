import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/database/client'
import { appointment, clinicalProcedure } from '@/database/schema'
import { AccessProfileFactory } from '@/tests/factories/access-profile'
import { AnimalFactory } from '@/tests/factories/animal'
import { AppointmentTypeFactory } from '@/tests/factories/appointment-type'
import { EmployeeFactory } from '@/tests/factories/employee'
import { ProcedureTypeFactory } from '@/tests/factories/procedure-type'
import { VeterinaryClinicFactory } from '@/tests/factories/veterinary-clinic'
import { getAuthToken } from '@/tests/utils'
import { createBaseApp } from '@/utils/fastify/create-base-app'
import Decimal from 'decimal.js'

import { clinicalProcedureRoutes } from '@/http/controllers/clinical-procedure/routes'

describe('Get clinical procedure by id', () => {
  const app = createBaseApp()
  let employeeId: number
  let token: string

  beforeAll(async () => {
    await app.register(clinicalProcedureRoutes)
    const profile = await AccessProfileFactory.create()
    const employee = await EmployeeFactory.create({ profileId: profile.id })
    employeeId = employee.id
    token = getAuthToken({ id: employeeId, roles: ['AdminPanel', 'ClinicalProcedures'] })
  })

  async function createAppointmentBase() {
    const animal = await AnimalFactory.create()
    const appointmentType = await AppointmentTypeFactory.create({ active: true })
    const clinic = await VeterinaryClinicFactory.create({ active: true })

    const [createdAppointment] = await db
      .insert(appointment)
      .values({
        animalId: animal.id,
        appointmentTypeId: appointmentType.id,
        clinicId: clinic.id,
        employeeId,
        appointmentDate: new Date(),
        consultationType: 'clinica',
        status: 'agendado',
        observations: null,
        createdAt: new Date(),
        updatedAt: null,
      })
      .returning()

    return { animal, createdAppointment }
  }

  it('should get clinical procedure by id', async () => {
    const { animal, createdAppointment } = await createAppointmentBase()
    const procedureType = await ProcedureTypeFactory.create({ active: true })

    const [createdProcedure] = await db
      .insert(clinicalProcedure)
      .values({
        animalId: animal.id,
        procedureTypeId: procedureType.id,
        appointmentId: createdAppointment.id,
        employeeId,
        procedureDate: new Date(),
        description: 'Procedimento de teste',
        actualCost: new Decimal('100.50'),
        observations: null,
        status: 'realizado',
        createdAt: new Date(),
      })
      .returning()

    const response = await app.inject({
      method: 'GET',
      url: `/clinical-procedure.key/${createdProcedure.id}`,
      headers: { authorization: `Bearer ${token}` },
    })

    const data = response.json()

    expect(response.statusCode).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data.id).toBe(createdProcedure.id)
    expect(data).toHaveProperty('animalId')
    expect(data.animalId).toBe(animal.id)
    expect(data).toHaveProperty('procedureTypeId')
    expect(data.procedureTypeId).toBe(procedureType.id)
    expect(data).toHaveProperty('description')
    expect(data.description).toBe('Procedimento de teste')
  })

  it('should return 404 when clinical procedure not found', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/clinical-procedure.key/99999',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should not access without token roles', async () => {
    const noRoleToken = getAuthToken({ id: employeeId })
    const response = await app.inject({
      method: 'GET',
      url: '/clinical-procedure.key/1',
      headers: { authorization: `Bearer ${noRoleToken}` },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should not access without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/clinical-procedure.key/1',
    })

    expect(response.statusCode).toBe(401)
  })
})

import bcrypt from 'bcryptjs'

import { db } from '@/database/client'
import { employee } from '@/database/schema/employee'
import { faker } from '@/tests/faker'
import { getValidationDigit } from '@/utils/cpf-cnpj'

import type { CreateEmployeeData } from '@/use-cases/employee/create-employee/create-employee.dto'

function generateCpf() {
  const base = faker.string.numeric({ length: 9, allowLeadingZeros: true })
  const digits = base.split('').map(Number)

  const firstDigit = getValidationDigit(digits, 10, 'cpf')
  const secondDigit = getValidationDigit([...digits, firstDigit], 11, 'cpf')

  return `${base}${firstDigit}${secondDigit}`
}

function generateLogin() {
  return `user${Date.now()}${faker.string.alphanumeric({ length: 8 }).toLowerCase()}`
}

const EmployeeFactory = {
  buildCreate: (props?: Partial<CreateEmployeeData>): CreateEmployeeData => ({
    name: faker.person.fullName(),
    login: generateLogin(),
    cpf: generateCpf(),
    email: faker.internet.email() || null,
    password: 'password123',
    profileId: 1,
    streetName: faker.location.street() || null,
    streetNumber: faker.location.buildingNumber() || null,
    district: faker.location.county() || null,
    city: faker.location.city() || null,
    state: faker.location.state({ abbreviated: true }) || null,
    postalCode: faker.location.zipCode().replace(/\D/g, '').slice(0, 8) || null,
    complement: faker.location.secondaryAddress() || null,
    phone1: faker.phone.number().replace(/\D/g, '').slice(0, 11) || null,
    phone2: faker.phone.number().replace(/\D/g, '').slice(0, 11) || null,
    ...props,
  }),

  build: (props?: Partial<typeof employee.$inferInsert>) => ({
    name: faker.person.fullName(),
    login: generateLogin(),
    cpf: generateCpf(),
    email: faker.internet.email(),
    passwordHash: bcrypt.hashSync('password123', 10),
    streetName: faker.location.street(),
    streetNumber: faker.location.buildingNumber(),
    district: faker.location.county(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    postalCode: faker.location.zipCode().replace(/\D/g, '').slice(0, 8),
    complement: faker.location.secondaryAddress(),
    phone1: faker.phone.number().replace(/\D/g, '').slice(0, 11),
    phone2: faker.phone.number().replace(/\D/g, '').slice(0, 11),
    profileId: 1,
    createdAt: new Date(),
    ...props,
  }),

  create: async (props?: Partial<typeof employee.$inferInsert>) => {
    const employeeData = EmployeeFactory.build(props)

    const [created] = await db.insert(employee).values(employeeData).returning()

    return created
  },
}

export { EmployeeFactory }

import { db } from '@/database/client'
import { veterinaryClinic } from '@/database/schema/veterinary-clinic'
import { faker } from '@/tests/faker'
import { getValidationDigit } from '@/utils/cpf-cnpj'

function generateCnpj() {
  const base = faker.string.numeric({ length: 12, allowLeadingZeros: true })
  const digits = base.split('').map(Number)

  const firstDigit = getValidationDigit(digits, 5, 'cnpj')
  const secondDigit = getValidationDigit([...digits, firstDigit], 6, 'cnpj')

  return `${base}${firstDigit}${secondDigit}`
}

import type { CreateVeterinaryClinicData } from '@/use-cases/veterinary-clinic/create-veterinary-clinic/create-veterinary-clinic.dto'

const VeterinaryClinicFactory = {
  buildCreate: (props?: Partial<CreateVeterinaryClinicData>): CreateVeterinaryClinicData => ({
    name: faker.company.name(),
    cnpj: generateCnpj(),
    phone: faker.phone.number().replace(/\D/g, '').slice(0, 20),
    address: faker.location.streetAddress(),
    responsible: faker.person.fullName(),
    specialties: faker.lorem.sentence(),
    ...props,
  }),

  build: (props?: Partial<typeof veterinaryClinic.$inferInsert>) => ({
    name: faker.company.name(),
    cnpj: generateCnpj(),
    phone: faker.phone.number().replace(/\D/g, '').slice(0, 20),
    address: faker.location.streetAddress(),
    responsible: faker.person.fullName(),
    specialties: faker.lorem.sentence(),
    active: true,
    registrationDate: new Date(),
    ...props,
  }),

  create: async (props?: Partial<typeof veterinaryClinic.$inferInsert>) => {
    const data = VeterinaryClinicFactory.build(props)

    const [created] = await db.insert(veterinaryClinic).values(data).returning()

    return created
  },
}

export { VeterinaryClinicFactory }

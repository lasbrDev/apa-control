import { db } from '@/database/client'
import { animal } from '@/database/schema/animal'
import { AnimalStatusValues } from '@/database/schema/enums/animal-status'
import { HealthConditionValues } from '@/database/schema/enums/health-condition'
import { SexValues } from '@/database/schema/enums/sex'
import { SizeValues } from '@/database/schema/enums/size'
import { SpeciesValues } from '@/database/schema/enums/species'
import { faker } from '@/tests/faker'

import type { CreateAnimalData } from '@/use-cases/animal/create-animal/create-animal.dto'

type CreateAnimalPartData = Omit<CreateAnimalData, 'employeeId'>

const AnimalFactory = {
  buildCreate: (props?: Partial<CreateAnimalPartData>): CreateAnimalPartData => ({
    name: faker.person.firstName(),
    species: faker.helpers.arrayElement(SpeciesValues),
    breed: faker.helpers.maybe(() => faker.animal.dog(), { probability: 0.7 }) ?? null,
    size: faker.helpers.arrayElement(SizeValues),
    sex: faker.helpers.arrayElement(SexValues),
    age: faker.number.int({ min: 0, max: 20 }),
    healthCondition: faker.helpers.arrayElement(HealthConditionValues),
    entryDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    observations: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }) ?? null,
    status: faker.helpers.arrayElement(AnimalStatusValues),
    ...props,
  }),

  build: (props?: Partial<typeof animal.$inferInsert>) => ({
    name: faker.person.firstName(),
    species: faker.helpers.arrayElement(SpeciesValues),
    breed: faker.helpers.maybe(() => faker.animal.dog(), { probability: 0.7 }) ?? null,
    size: faker.helpers.arrayElement(SizeValues),
    sex: faker.helpers.arrayElement(SexValues),
    age: faker.number.int({ min: 0, max: 20 }),
    healthCondition: faker.helpers.arrayElement(HealthConditionValues),
    entryDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    observations: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }) ?? null,
    status: faker.helpers.arrayElement(AnimalStatusValues),
    createdAt: new Date(),
    ...props,
  }),

  create: async (props?: Partial<typeof animal.$inferInsert>) => {
    const animalData = AnimalFactory.build(props)

    const [created] = await db.insert(animal).values(animalData).returning()

    return created
  },
}

export { AnimalFactory }

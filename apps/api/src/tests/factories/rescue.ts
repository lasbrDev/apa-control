import { faker } from '@/tests/faker'

import { AnimalFactory } from './animal'

import type { CreateRescueBody } from '@/http/controllers/rescue/create-rescue/create-rescue.schema'

const rescueFields = () => ({
  rescueDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
  locationFound: faker.location.streetAddress(),
  circumstances: faker.lorem.sentence(),
  foundConditions: faker.lorem.sentence(),
  immediateProcedures: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? null,
  observations: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? null,
})

const RescueFactory = {
  /** Payload para POST rescue.add com animal existente (animalId). */
  buildCreateWithAnimalId: (props?: Partial<Omit<CreateRescueBody, 'animal'>>): CreateRescueBody => ({
    ...rescueFields(),
    animalId: 1,
    ...props,
  }),

  /** Payload para POST rescue.add com novo animal (animal). */
  buildCreateWithAnimal: (
    props?: Partial<Omit<CreateRescueBody, 'animalId'>> & { animal?: Partial<CreateRescueBody['animal']> },
  ): CreateRescueBody => ({
    ...rescueFields(),
    animal: { ...AnimalFactory.buildCreate(), ...props?.animal },
    ...props,
  }),
}

export { RescueFactory }

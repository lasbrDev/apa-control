import { db } from '@/database/client'
import { finalDestinationType } from '@/database/schema/final-destination-type'
import { faker } from '@/tests/faker'

import type { CreateFinalDestinationTypeData } from '@/use-cases/final-destination-type/create-final-destination-type/create-final-destination-type.dto'

const FinalDestinationTypeFactory = {
  buildCreate: (props?: Partial<CreateFinalDestinationTypeData>): CreateFinalDestinationTypeData => ({
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    active: true,
    ...props,
  }),

  build: (props?: Partial<typeof finalDestinationType.$inferInsert>) => ({
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    active: true,
    createdAt: new Date(),
    ...props,
  }),

  create: async (props?: Partial<typeof finalDestinationType.$inferInsert>) => {
    const data = FinalDestinationTypeFactory.build(props)

    const [created] = await db.insert(finalDestinationType).values(data).returning()

    return created
  },
}

export { FinalDestinationTypeFactory }

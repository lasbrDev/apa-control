import { faker } from '@/tests/faker'
import type { CreateRevenueData } from '@/use-cases/revenue/create-revenue/create-revenue.dto'

const RevenueFactory = {
  buildCreate: (props?: Partial<CreateRevenueData>): CreateRevenueData => ({
    transactionTypeId: 1,
    campaignId: null,
    animalId: null,
    description: faker.lorem.sentence({ min: 2, max: 6 }),
    value: faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
    observations: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }) ?? null,
    proof: null,
    ...props,
  }),
}

export { RevenueFactory }

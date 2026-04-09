import { faker } from '@/tests/faker'
import type { CreateExpenseData } from '@/use-cases/expense/create-expense/create-expense.dto'

const ExpenseFactory = {
  buildCreate: (props?: Partial<CreateExpenseData>): CreateExpenseData => ({
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

export { ExpenseFactory }

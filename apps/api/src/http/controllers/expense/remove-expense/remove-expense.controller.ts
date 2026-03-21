import { makeRemoveExpenseUseCase } from '@/use-cases/expense/remove-expense/remove-expense.factory'
import type { FastifyRequest } from 'fastify'
import { removeExpenseSchema } from './remove-expense.schema'

export async function removeExpenseController(request: FastifyRequest) {
  const { id } = removeExpenseSchema.parse(request.params)

  const removeExpenseUseCase = makeRemoveExpenseUseCase()
  await removeExpenseUseCase.execute({ id })

  return { message: 'Despesa removida com sucesso' }
}

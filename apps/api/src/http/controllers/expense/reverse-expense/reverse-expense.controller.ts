import { makeReverseExpenseUseCase } from '@/use-cases/expense/reverse-expense/reverse-expense.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { reverseExpenseSchema } from './reverse-expense.schema'

export async function reverseExpenseController(request: FastifyRequest, reply: FastifyReply) {
  const data = reverseExpenseSchema.parse(request.body)
  const employeeId = request.user.id
  const reverseExpenseUseCase = makeReverseExpenseUseCase()
  await reverseExpenseUseCase.execute(data, employeeId)
  reply.status(204).send()
}

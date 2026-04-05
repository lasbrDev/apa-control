import { makeCancelExpensesUseCase } from '@/use-cases/expense/cancel-expenses/cancel-expenses.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { cancelExpensesSchema } from './cancel-expenses.schema'

export async function cancelExpensesController(request: FastifyRequest, reply: FastifyReply) {
  const data = cancelExpensesSchema.parse(request.body)
  const employeeId = request.user.id
  const cancelExpensesUseCase = makeCancelExpensesUseCase()
  await cancelExpensesUseCase.execute(data, employeeId)
  reply.status(204).send()
}

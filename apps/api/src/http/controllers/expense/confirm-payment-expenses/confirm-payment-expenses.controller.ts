import { makeConfirmPaymentExpensesUseCase } from '@/use-cases/expense/confirm-payment-expenses/confirm-payment-expenses.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { confirmPaymentExpensesSchema } from './confirm-payment-expenses.schema'

export async function confirmPaymentExpensesController(request: FastifyRequest, reply: FastifyReply) {
  const data = confirmPaymentExpensesSchema.parse(request.body)
  const employeeId = request.user.id
  const confirmPaymentExpensesUseCase = makeConfirmPaymentExpensesUseCase()
  await confirmPaymentExpensesUseCase.execute(data, employeeId)
  reply.status(204).send()
}

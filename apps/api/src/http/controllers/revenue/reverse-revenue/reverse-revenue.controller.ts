import { makeReverseRevenueUseCase } from '@/use-cases/revenue/reverse-revenue/reverse-revenue.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { reverseRevenueSchema } from './reverse-revenue.schema'

export async function reverseRevenueController(request: FastifyRequest, reply: FastifyReply) {
  const data = reverseRevenueSchema.parse(request.body)
  const employeeId = request.user.id
  const reverseRevenueUseCase = makeReverseRevenueUseCase()
  await reverseRevenueUseCase.execute(data, employeeId)
  reply.status(204).send()
}

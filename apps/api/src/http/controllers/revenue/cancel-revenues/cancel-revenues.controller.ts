import { makeCancelRevenuesUseCase } from '@/use-cases/revenue/cancel-revenues/cancel-revenues.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { cancelRevenuesSchema } from './cancel-revenues.schema'

export async function cancelRevenuesController(request: FastifyRequest, reply: FastifyReply) {
  const data = cancelRevenuesSchema.parse(request.body)
  const cancelRevenuesUseCase = makeCancelRevenuesUseCase()
  await cancelRevenuesUseCase.execute(data)
  reply.status(204).send()
}

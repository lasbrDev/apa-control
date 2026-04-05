import { makeConfirmRevenuesUseCase } from '@/use-cases/revenue/confirm-revenues/confirm-revenues.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { confirmRevenuesSchema } from './confirm-revenues.schema'

export async function confirmRevenuesController(request: FastifyRequest, reply: FastifyReply) {
  const data = confirmRevenuesSchema.parse(request.body)
  const confirmRevenuesUseCase = makeConfirmRevenuesUseCase()
  await confirmRevenuesUseCase.execute(data)
  reply.status(204).send()
}

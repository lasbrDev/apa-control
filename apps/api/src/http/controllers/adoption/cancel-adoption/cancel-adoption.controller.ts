import { makeCancelAdoptionUseCase } from '@/use-cases/adoption/cancel-adoption/cancel-adoption.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { cancelAdoptionSchema } from './cancel-adoption.schema'

export async function cancelAdoptionController(request: FastifyRequest, reply: FastifyReply) {
  const body = cancelAdoptionSchema.parse(request.body)
  const employeeId = request.user.id

  const cancelAdoptionUseCase = makeCancelAdoptionUseCase()
  await cancelAdoptionUseCase.execute({ ...body, employeeId })

  return reply.status(204).send()
}

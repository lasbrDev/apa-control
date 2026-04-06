import { makeCancelAdoptionsUseCase } from '@/use-cases/adoption/cancel-adoptions/cancel-adoptions.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { cancelAdoptionsSchema } from './cancel-adoptions.schema'

export async function cancelAdoptionsController(request: FastifyRequest, reply: FastifyReply) {
  const data = cancelAdoptionsSchema.parse(request.body)
  const cancelAdoptionsUseCase = makeCancelAdoptionsUseCase()
  await cancelAdoptionsUseCase.execute(data)
  reply.status(204).send()
}

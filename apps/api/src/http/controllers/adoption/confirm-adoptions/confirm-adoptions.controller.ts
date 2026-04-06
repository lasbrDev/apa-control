import { makeConfirmAdoptionsUseCase } from '@/use-cases/adoption/confirm-adoptions/confirm-adoptions.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { confirmAdoptionsSchema } from './confirm-adoptions.schema'

export async function confirmAdoptionsController(request: FastifyRequest, reply: FastifyReply) {
  const data = confirmAdoptionsSchema.parse(request.body)
  const confirmAdoptionsUseCase = makeConfirmAdoptionsUseCase()
  await confirmAdoptionsUseCase.execute(data)
  reply.status(204).send()
}

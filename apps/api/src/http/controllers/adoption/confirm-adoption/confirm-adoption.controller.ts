import { makeConfirmAdoptionUseCase } from '@/use-cases/adoption/confirm-adoption/confirm-adoption.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { confirmAdoptionSchema } from './confirm-adoption.schema'

export async function confirmAdoptionController(request: FastifyRequest, reply: FastifyReply) {
  const body = confirmAdoptionSchema.parse(request.body)
  const employeeId = request.user.id

  const confirmAdoptionUseCase = makeConfirmAdoptionUseCase()
  await confirmAdoptionUseCase.execute({ ...body, employeeId })

  return reply.status(204).send()
}

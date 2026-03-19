import { makeUpdateRescueUseCase } from '@/use-cases/rescue/update-rescue/update-rescue.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateRescueSchema } from './update-rescue.schema'

export async function updateRescueController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateRescueSchema.parse(request.body)
  const updateRescueUseCase = makeUpdateRescueUseCase()

  const employeeId = request.user.id

  await updateRescueUseCase.execute({ ...data, employeeId })

  return reply.status(204).send()
}

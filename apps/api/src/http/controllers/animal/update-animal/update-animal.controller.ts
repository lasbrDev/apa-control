import { makeUpdateAnimalUseCase } from '@/use-cases/animal/update-animal/update-animal.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateAnimalSchema } from './update-animal.schema'

export async function updateAnimalController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateAnimalSchema.parse(request.body)
  const updateAnimalUseCase = makeUpdateAnimalUseCase()

  const employeeId = request.user.id
  await updateAnimalUseCase.execute({ ...data, employeeId })

  return reply.status(204).send()
}

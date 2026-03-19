import { makeCreateAnimalUseCase } from '@/use-cases/animal/create-animal/create-animal.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAnimalSchema } from './create-animal.schema'

export async function createAnimalController(request: FastifyRequest, reply: FastifyReply) {
  const data = createAnimalSchema.parse(request.body)
  const createAnimalUseCase = makeCreateAnimalUseCase()

  const employeeId = request.user.id
  const id = await createAnimalUseCase.execute({ ...data, employeeId })
  return reply.status(201).send({ id })
}

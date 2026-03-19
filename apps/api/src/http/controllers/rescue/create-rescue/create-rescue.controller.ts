import { makeCreateRescueUseCase } from '@/use-cases/rescue/create-rescue/create-rescue.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createRescueSchema } from './create-rescue.schema'

export async function createRescueController(request: FastifyRequest, reply: FastifyReply) {
  const body = createRescueSchema.parse(request.body)
  const employeeId = request.user.id

  const createRescueUseCase = makeCreateRescueUseCase()
  const id = await createRescueUseCase.execute({
    employeeId,
    animalId: body.animalId,
    animal: body.animal,
    rescueDate: body.rescueDate,
    locationFound: body.locationFound,
    circumstances: body.circumstances,
    foundConditions: body.foundConditions,
    immediateProcedures: body.immediateProcedures ?? null,
    observations: body.observations ?? null,
  })

  return reply.status(201).send({ id })
}

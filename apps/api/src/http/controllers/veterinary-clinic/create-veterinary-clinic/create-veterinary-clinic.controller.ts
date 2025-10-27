import { makeCreateVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/create-veterinary-clinic/create-veterinary-clinic.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createVeterinaryClinicSchema } from './create-veterinary-clinic.schema'

export async function createVeterinaryClinicController(request: FastifyRequest, reply: FastifyReply) {
  const data = createVeterinaryClinicSchema.parse(request.body)
  const createVeterinaryClinicUseCase = makeCreateVeterinaryClinicUseCase()

  const { id } = await createVeterinaryClinicUseCase.execute(data)
  return reply.status(201).send({ id })
}

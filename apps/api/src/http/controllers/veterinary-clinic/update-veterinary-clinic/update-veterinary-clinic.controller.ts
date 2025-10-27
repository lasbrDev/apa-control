import { makeUpdateVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/update-veterinary-clinic/update-veterinary-clinic.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updateVeterinaryClinicSchema } from './update-veterinary-clinic.schema'

export async function updateVeterinaryClinicController(request: FastifyRequest, reply: FastifyReply) {
  const data = updateVeterinaryClinicSchema.parse(request.body)

  const updateVeterinaryClinicUseCase = makeUpdateVeterinaryClinicUseCase()
  await updateVeterinaryClinicUseCase.execute(data)

  return reply.status(204).send()
}

import { makeDisableVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/disable-veterinary-clinic/disable-veterinary-clinic.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { disableVeterinaryClinicSchema } from './disable-veterinary-clinic.schema'

export async function disableVeterinaryClinicController(request: FastifyRequest, reply: FastifyReply) {
  const data = disableVeterinaryClinicSchema.parse(request.body)

  const disableVeterinaryClinicUseCase = makeDisableVeterinaryClinicUseCase()
  await disableVeterinaryClinicUseCase.execute(data)

  return reply.status(204).send()
}

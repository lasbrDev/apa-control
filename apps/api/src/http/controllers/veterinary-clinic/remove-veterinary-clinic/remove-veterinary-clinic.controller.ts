import { db } from '@/database/client'
import { makeRemoveVeterinaryClinicUseCase } from '@/use-cases/veterinary-clinic/remove-veterinary-clinic/remove-veterinary-clinic.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeVeterinaryClinicSchema } from './remove-veterinary-clinic.schema'

export async function removeVeterinaryClinicController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeVeterinaryClinicSchema.parse(request.params)

  const removeVeterinaryClinicUseCase = makeRemoveVeterinaryClinicUseCase()
  await db.transaction((dbTransaction) => removeVeterinaryClinicUseCase.execute({ id }, dbTransaction))

  return reply.status(204).send()
}

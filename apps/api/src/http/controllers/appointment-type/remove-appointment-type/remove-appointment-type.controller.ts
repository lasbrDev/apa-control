import { db } from '@/database/client'
import { makeRemoveAppointmentTypeUseCase } from '@/use-cases/appointment-type/remove-appointment-type/remove-appointment-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { removeAppointmentTypeSchema } from './remove-appointment-type.schema'

export async function removeAppointmentTypeController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = removeAppointmentTypeSchema.parse(request.params)

  const removeAppointmentTypeUseCase = makeRemoveAppointmentTypeUseCase()
  await db.transaction((dbTransaction) => removeAppointmentTypeUseCase.execute({ id }, dbTransaction))

  return reply.status(204).send()
}

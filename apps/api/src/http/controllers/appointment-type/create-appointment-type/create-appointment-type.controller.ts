import { makeCreateAppointmentTypeUseCase } from '@/use-cases/appointment-type/create-appointment-type/create-appointment-type.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createAppointmentTypeSchema } from './create-appointment-type.schema'

export async function createAppointmentTypeController(request: FastifyRequest, reply: FastifyReply) {
  const data = createAppointmentTypeSchema.parse(request.body)
  const createAppointmentTypeUseCase = makeCreateAppointmentTypeUseCase()

  const { id } = await createAppointmentTypeUseCase.execute(data)
  return reply.status(201).send({ id })
}

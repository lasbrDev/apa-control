import { makeListAppointmentsUseCase } from '@/use-cases/appointment/list-appointments/list-appointments.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listAppointmentsSchema } from './list-appointments.schema'

export async function listAppointmentsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listAppointmentsSchema.parse(request.query)
  const useCase = makeListAppointmentsUseCase()
  const [count, items] = await useCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Consultas', 'consultas', items)
  }

  reply.header('X-Total-Count', count)
  return items
}

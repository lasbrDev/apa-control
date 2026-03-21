import { makeListAppointmentTypesUseCase } from '@/use-cases/appointment-type/list-appointment-types/list-appointment-types.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const querySchema = z.object({
  exportType: z.enum(['csv', 'xlsx', 'pdf']).optional(),
})

export async function listAppointmentTypesController(request: FastifyRequest, reply: FastifyReply) {
  const data = querySchema.parse(request.query)
  const listAppointmentTypesUseCase = makeListAppointmentTypesUseCase()
  const result = await listAppointmentTypesUseCase.execute()

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Tipos de Consulta', 'tipos-consulta', result)
  }

  return result
}

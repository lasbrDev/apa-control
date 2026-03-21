import { makeListClinicalProceduresUseCase } from '@/use-cases/clinical-procedure/list-clinical-procedures/list-clinical-procedures.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listClinicalProceduresSchema } from './list-clinical-procedures.schema'

export async function listClinicalProceduresController(request: FastifyRequest, reply: FastifyReply) {
  const data = listClinicalProceduresSchema.parse(request.query)
  const useCase = makeListClinicalProceduresUseCase()
  const [count, items] = await useCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Procedimentos Clinicos', 'procedimentos-clinicos', items)
  }

  reply.header('X-Total-Count', count)
  return items
}

import { makeListProcedureTypesUseCase } from '@/use-cases/procedure-type/list-procedure-types/list-procedure-types.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listProcedureTypesSchema } from './list-procedure-types.schema'

export async function listProcedureTypesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listProcedureTypesSchema.parse(request.query)
  const listProcedureTypesUseCase = makeListProcedureTypesUseCase()
  const [count, items] = await listProcedureTypesUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Tipos de Procedimento', 'tipos-procedimento', items)
  }

  reply.header('X-Total-Count', count)

  return items
}

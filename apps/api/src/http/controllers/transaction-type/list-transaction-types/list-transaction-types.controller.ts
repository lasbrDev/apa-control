import { makeListTransactionTypesUseCase } from '@/use-cases/transaction-type/list-transaction-types/list-transaction-types.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listTransactionTypesSchema } from './list-transaction-types.schema'

export async function listTransactionTypesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listTransactionTypesSchema.parse(request.query)
  const listTransactionTypesUseCase = makeListTransactionTypesUseCase()
  const [count, items] = await listTransactionTypesUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Tipos de Lancamento', 'tipos-lancamento', items)
  }

  reply.header('X-Total-Count', count)

  return items
}

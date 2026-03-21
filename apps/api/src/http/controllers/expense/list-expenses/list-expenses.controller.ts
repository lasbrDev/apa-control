import { makeListExpensesUseCase } from '@/use-cases/expense/list-expenses/list-expenses.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listExpensesSchema } from './list-expenses.schema'

export async function listExpensesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listExpensesSchema.parse(request.query)
  const listExpensesUseCase = makeListExpensesUseCase()
  const [count, items] = await listExpensesUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Despesas', 'despesas', items)
  }

  reply.header('X-Total-Count', count)
  return items
}

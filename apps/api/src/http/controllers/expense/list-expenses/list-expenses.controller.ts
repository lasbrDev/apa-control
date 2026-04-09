import { makeListExpensesUseCase } from '@/use-cases/expense/list-expenses/list-expenses.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listExpensesSchema } from './list-expenses.schema'

function isOverdue(dueDate: unknown): boolean {
  if (!dueDate) return false
  const parsed = dueDate instanceof Date ? dueDate : new Date(String(dueDate))
  if (Number.isNaN(parsed.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)
  return parsed < today
}

export async function listExpensesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listExpensesSchema.parse(request.query)
  const listExpensesUseCase = makeListExpensesUseCase()
  const [count, items] = await listExpensesUseCase.execute(data)

  if (data.exportType) {
    const exportItems = items.map(({ proof: _proof, ...rest }) => ({
      ...rest,
      status: rest.status === 'pendente' && isOverdue(rest.dueDate) ? 'vencido' : rest.status,
    }))
    return exportListData(reply, data.exportType, 'Despesas', 'despesas', exportItems, { pdfLandscape: true })
  }

  reply.header('X-Total-Count', count)
  return items
}

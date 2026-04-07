import { makeListRevenuesUseCase } from '@/use-cases/revenue/list-revenues/list-revenues.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listRevenuesSchema } from './list-revenues.schema'

export async function listRevenuesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listRevenuesSchema.parse(request.query)
  const listRevenuesUseCase = makeListRevenuesUseCase()
  const [count, items] = await listRevenuesUseCase.execute(data)

  if (data.exportType) {
    const exportItems = items.map(({ proof: _proof, ...rest }) => rest)
    return exportListData(reply, data.exportType, 'Receitas', 'receitas', exportItems)
  }

  reply.header('X-Total-Count', count)
  return items
}

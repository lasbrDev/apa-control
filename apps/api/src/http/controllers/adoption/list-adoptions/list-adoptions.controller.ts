import { makeListAdoptionsUseCase } from '@/use-cases/adoption/list-adoptions/list-adoptions.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listAdoptionsSchema } from './list-adoptions.schema'

export async function listAdoptionsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listAdoptionsSchema.parse(request.query)
  const listAdoptionsUseCase = makeListAdoptionsUseCase()
  const [count, items] = await listAdoptionsUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Adocoes', 'adocoes', items)
  }

  reply.header('X-Total-Count', count)
  return items
}

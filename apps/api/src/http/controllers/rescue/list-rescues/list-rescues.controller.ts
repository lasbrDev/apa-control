import { makeListRescuesUseCase } from '@/use-cases/rescue/list-rescues/list-rescues.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listRescuesSchema } from './list-rescues.schema'

export async function listRescuesController(request: FastifyRequest, reply: FastifyReply) {
  const data = listRescuesSchema.parse(request.query)
  const listRescuesUseCase = makeListRescuesUseCase()
  const [count, items] = await listRescuesUseCase.execute(data)

  reply.header('X-Total-Count', count)

  return items
}

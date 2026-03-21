import { makeListPostsUseCase } from '@/use-cases/post/list-posts/list-posts.factory'
import { exportListData } from '@/utils/report/list-export'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { listPostsSchema } from './list-posts.schema'

export async function listPostsController(request: FastifyRequest, reply: FastifyReply) {
  const data = listPostsSchema.parse(request.query)
  const listPostsUseCase = makeListPostsUseCase()
  const [count, items] = await listPostsUseCase.execute(data)

  if (data.exportType) {
    return exportListData(reply, data.exportType, 'Publicacoes', 'publicacoes', items)
  }

  reply.header('X-Total-Count', count)
  return items
}

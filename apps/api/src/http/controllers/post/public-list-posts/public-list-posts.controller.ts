import { makeListPublicPostsUseCase } from '@/use-cases/post/public/list-public-posts.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { publicListPostsSchema } from './public-list-posts.schema'

export async function publicListPostsController(request: FastifyRequest, reply: FastifyReply) {
  const data = publicListPostsSchema.parse(request.query)
  const listPublicPostsUseCase = makeListPublicPostsUseCase()
  const [count, items] = await listPublicPostsUseCase.execute(data)

  reply.header('X-Total-Count', count)
  return items
}

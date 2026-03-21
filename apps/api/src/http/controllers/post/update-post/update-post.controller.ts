import { makeUpdatePostUseCase } from '@/use-cases/post/update-post/update-post.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updatePostSchema } from './update-post.schema'

export async function updatePostController(request: FastifyRequest, reply: FastifyReply) {
  const body = updatePostSchema.parse(request.body)

  const updatePostUseCase = makeUpdatePostUseCase()
  await updatePostUseCase.execute(body)

  return reply.status(204).send()
}

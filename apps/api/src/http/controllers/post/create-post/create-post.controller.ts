import { makeCreatePostUseCase } from '@/use-cases/post/create-post/create-post.factory'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createPostSchema } from './create-post.schema'

export async function createPostController(request: FastifyRequest, reply: FastifyReply) {
  const body = createPostSchema.parse(request.body)
  const employeeId = request.user.id

  const createPostUseCase = makeCreatePostUseCase()
  const id = await createPostUseCase.execute(body, employeeId)

  return reply.status(201).send({ id })
}

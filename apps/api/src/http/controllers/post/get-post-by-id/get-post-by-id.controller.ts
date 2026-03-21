import { makeGetPostByIdUseCase } from '@/use-cases/post/get-post-by-id/get-post-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { getPostByIdSchema } from './get-post-by-id.schema'

export async function getPostByIdController(request: FastifyRequest) {
  const { id } = getPostByIdSchema.parse(request.params)

  const getPostByIdUseCase = makeGetPostByIdUseCase()
  return await getPostByIdUseCase.execute({ id })
}

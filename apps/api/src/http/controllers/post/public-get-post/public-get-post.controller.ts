import { makePublicGetPostUseCase } from '@/use-cases/post/public/get-public-post-by-id.factory'
import type { FastifyRequest } from 'fastify'
import { publicGetPostSchema } from './public-get-post.schema'

export async function publicGetPostController(request: FastifyRequest) {
  const { id } = publicGetPostSchema.parse(request.params)
  const useCase = makePublicGetPostUseCase()
  return await useCase.execute({ id })
}

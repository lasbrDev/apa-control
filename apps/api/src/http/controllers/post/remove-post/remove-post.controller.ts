import { makeRemovePostUseCase } from '@/use-cases/post/remove-post/remove-post.factory'
import type { FastifyRequest } from 'fastify'
import { removePostSchema } from './remove-post.schema'

export async function removePostController(request: FastifyRequest) {
  const { id } = removePostSchema.parse(request.params)

  const removePostUseCase = makeRemovePostUseCase()
  await removePostUseCase.execute({ id })

  return { message: 'Publicação removida com sucesso' }
}

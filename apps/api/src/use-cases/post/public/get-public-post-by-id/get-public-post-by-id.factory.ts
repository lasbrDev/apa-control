import { PostRepository } from '@/repositories/post.repository'
import { GetPublicPostByIdUseCase } from './get-public-post-by-id'

export function makePublicGetPostUseCase() {
  return new GetPublicPostByIdUseCase(new PostRepository())
}

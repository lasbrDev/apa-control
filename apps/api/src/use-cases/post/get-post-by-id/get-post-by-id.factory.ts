import { PostRepository } from '@/repositories/post.repository'
import { GetPostByIdUseCase } from './get-post-by-id'

export function makeGetPostByIdUseCase() {
  return new GetPostByIdUseCase(new PostRepository())
}

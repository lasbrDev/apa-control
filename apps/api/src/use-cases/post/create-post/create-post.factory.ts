import { PostRepository } from '@/repositories/post.repository'
import { CreatePostUseCase } from './create-post'

export function makeCreatePostUseCase() {
  return new CreatePostUseCase(new PostRepository())
}

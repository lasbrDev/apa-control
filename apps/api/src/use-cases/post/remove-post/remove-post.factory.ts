import { PostRepository } from '@/repositories/post.repository'
import { RemovePostUseCase } from './remove-post'

export function makeRemovePostUseCase() {
  return new RemovePostUseCase(new PostRepository())
}

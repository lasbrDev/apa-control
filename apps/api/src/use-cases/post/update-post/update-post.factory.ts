import { PostRepository } from '@/repositories/post.repository'
import { UpdatePostUseCase } from './update-post'

export function makeUpdatePostUseCase() {
  return new UpdatePostUseCase(new PostRepository())
}

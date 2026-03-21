import { PostRepository } from '@/repositories/post.repository'
import { ListPostsUseCase } from './list-posts'

export function makeListPostsUseCase() {
  return new ListPostsUseCase(new PostRepository())
}

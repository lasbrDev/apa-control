import { PostRepository } from '@/repositories/post.repository'
import { ListPublicPostsUseCase } from './list-public-posts'

export function makeListPublicPostsUseCase() {
  return new ListPublicPostsUseCase(new PostRepository())
}

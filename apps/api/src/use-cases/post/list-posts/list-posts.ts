import type { PostRepository } from '@/repositories/post.repository'
import type { ListPostsData, PostWithDetails } from './list-posts.dto'

export class ListPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: ListPostsData): Promise<[number, PostWithDetails[]]> {
    return await this.postRepository.list(data)
  }
}

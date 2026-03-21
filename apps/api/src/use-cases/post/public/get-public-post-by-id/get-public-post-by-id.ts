import { PostStatus } from '@/database/schema/enums/post-status'
import type { PostRepository } from '@/repositories/post.repository'
import type { PostWithDetails } from '@/use-cases/post/list-posts/list-posts.dto'
import { ApiError } from '@/utils/api-error'
import type { GetPublicPostByIdData } from './get-public-post-by-id.dto'

export class GetPublicPostByIdUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: GetPublicPostByIdData): Promise<PostWithDetails> {
    const post = await this.postRepository.findByIdOrThrow(data.id)
    if (post.status !== PostStatus.PUBLISHED) throw new ApiError('Publicação não encontrada.', 404)
    return post as PostWithDetails
  }
}

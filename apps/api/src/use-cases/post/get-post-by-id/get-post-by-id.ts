import type { PostRepository } from '@/repositories/post.repository'
import { ApiError } from '@/utils/api-error'
import type { PostWithDetails } from '../list-posts/list-posts.dto'
import type { GetPostByIdData } from './get-post-by-id.dto'

export class GetPostByIdUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: GetPostByIdData): Promise<PostWithDetails> {
    const post = await this.postRepository.findById(data.id)
    if (!post) throw new ApiError('Publicação não encontrada.', 404)
    return post as PostWithDetails
  }
}

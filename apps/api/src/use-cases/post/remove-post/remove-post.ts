import type { PostRepository } from '@/repositories/post.repository'
import { ApiError } from '@/utils/api-error'
import type { RemovePostData } from './remove-post.dto'

export class RemovePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: RemovePostData): Promise<void> {
    const existing = await this.postRepository.findById(data.id)
    if (!existing) throw new ApiError('Publicação não encontrada.', 404)

    await this.postRepository.delete(data.id)
  }
}

import { Post } from '@/entities'
import type { PostRepository } from '@/repositories/post.repository'
import { ApiError } from '@/utils/api-error'
import type { UpdatePostData } from './update-post.dto'

export class UpdatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: UpdatePostData): Promise<void> {
    const existing = await this.postRepository.findById(data.id)
    if (!existing) throw new ApiError('Publicação não encontrada.', 404)

    const publicationDate = new Date(data.publicationDate)
    if (Number.isNaN(publicationDate.getTime())) throw new ApiError('Data inválida.', 400)

    await this.postRepository.update(
      data.id,
      {
        title: data.title,
        content: data.content,
        type: data.type,
        publicationDate,
        status: data.status,
        relatedAnimals: data.relatedAnimals ?? null,
      },
      null,
    )
  }
}

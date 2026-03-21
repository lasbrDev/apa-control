import { Post } from '@/entities'
import type { PostRepository } from '@/repositories/post.repository'
import { ApiError } from '@/utils/api-error'
import type { CreatePostData } from './create-post.dto'

export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: CreatePostData, employeeId: number): Promise<number> {
    const publicationDate = new Date(data.publicationDate)
    if (Number.isNaN(publicationDate.getTime())) throw new ApiError('Data inválida.', 400)

    const [result] = await this.postRepository.create(
      new Post({
        employeeId,
        title: data.title,
        content: data.content,
        type: data.type,
        publicationDate,
        status: data.status,
        relatedAnimals: data.relatedAnimals ?? null,
        createdAt: new Date(),
        updatedAt: null,
      }),
      null,
    )

    return result!.id
  }
}

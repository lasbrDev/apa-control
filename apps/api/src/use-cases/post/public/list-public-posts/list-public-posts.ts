import { PostStatus } from '@/database/schema/enums/post-status'
import type { PostRepository } from '@/repositories/post.repository'
import type { PostWithDetails } from '@/use-cases/post/list-posts/list-posts.dto'
import { ApiError } from '@/utils/api-error'
import type { ListPublicPostsData } from './list-public-posts.dto'

function parseRelatedAnimalIds(value: string | null | undefined): number[] {
  if (!value) return []
  const trimmed = value.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n))
      }
    } catch {
      // intentional no-op
    }
  }

  const matches = trimmed.match(/\d+/g)
  if (!matches) return []
  return matches.map((m) => Number(m)).filter((n) => Number.isFinite(n))
}

export class ListPublicPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: ListPublicPostsData): Promise<[number, PostWithDetails[]]> {
    const { type, animalId, publicationDateStart, publicationDateEnd, page, perPage, sort, fields } = data

    const [, allPublished] = await this.postRepository.list({
      status: PostStatus.PUBLISHED,
      type,
      publicationDateStart,
      publicationDateEnd,
      sort,
      fields,
    })

    const filtered = animalId
      ? allPublished.filter((post) => parseRelatedAnimalIds(post.relatedAnimals).includes(animalId))
      : allPublished

    const shouldPaginate = typeof page === 'number' || typeof perPage === 'number'
    if (!shouldPaginate) {
      return [filtered.length, filtered]
    }

    const currentPage = page ?? 1
    const currentPerPage = perPage ?? 10
    if (currentPage < 1 || currentPerPage < 1) throw new ApiError('Parâmetros de paginação inválidos.', 400)

    const start = (currentPage - 1) * currentPerPage
    const end = start + currentPerPage
    return [filtered.length, filtered.slice(start, end)]
  }
}

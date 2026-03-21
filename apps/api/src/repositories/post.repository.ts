import { db } from '@/database/client'
import { employee, post } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Post } from '@/entities'
import type { ListPostsData, PostWithDetails } from '@/use-cases/post/list-posts/list-posts.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, eq, gte, ilike, lte } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: post,
  initialOrderBy: post.publicationDate,
  includes: [[employee, eq(employee.id, post.employeeId)]],
  customFields: {
    employeeName: employee.name,
  },
}

export class PostRepository {
  create(data: Post, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(post).values(data).returning({ id: post.id })
  }

  async list(data: ListPostsData): Promise<[number, PostWithDetails[]]> {
    const { title, type, status, employeeId, publicationDateStart, publicationDateEnd } = data
    const whereList: SQL[] = []

    if (title) whereList.push(ilike(post.title, `%${title}%`))
    if (type) whereList.push(eq(post.type, type))
    if (status) whereList.push(eq(post.status, status))
    if (employeeId) whereList.push(eq(post.employeeId, employeeId))
    if (publicationDateStart) whereList.push(gte(post.publicationDate, new Date(publicationDateStart)))
    if (publicationDateEnd) whereList.push(lte(post.publicationDate, new Date(publicationDateEnd)))

    const [sqlQuery, countQuery] = querifyString<PostWithDetails>(data, whereList, querifyStringSettings)
    const items = await sqlQuery
    const [{ total }] = await countQuery
    return [total, items]
  }

  async findById(id: number) {
    const [item] = await db
      .select({
        id: post.id,
        employeeId: post.employeeId,
        title: post.title,
        content: post.content,
        type: post.type,
        publicationDate: post.publicationDate,
        status: post.status,
        relatedAnimals: post.relatedAnimals,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        employeeName: employee.name,
      })
      .from(post)
      .leftJoin(employee, eq(employee.id, post.employeeId))
      .where(eq(post.id, id))

    if (!item) return null
    return item
  }

  async findByIdOrThrow(id: number) {
    const item = await this.findById(id)
    if (!item) throw new ApiError('Publicação não encontrada.', 404)
    return item
  }

  async update(id: number, data: Partial<Omit<Post, 'id'>>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection
      .update(post)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(post.id, id))
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(post).where(eq(post.id, id))
  }
}

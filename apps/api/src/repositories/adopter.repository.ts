import { db } from '@/database/client'
import { adopter } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Adopter } from '@/entities'
import type { ListAdoptersDTO, ListAdoptersData } from '@/use-cases/adopter/list-adopters/list-adopters.dto'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, eq, ilike } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: adopter,
  initialOrderBy: adopter.name,
}

const querifySettings: QuerySettings = {
  table: adopter,
  initialOrderBy: adopter.name,
}

export class AdopterRepository {
  async create(data: Adopter) {
    const [result] = await db.insert(adopter).values(data).returning({ id: adopter.id })

    return result
  }

  async update(id: number, data: Partial<Adopter>) {
    await db.update(adopter).set(data).where(eq(adopter.id, id))
  }

  async list(data: ListAdoptersData): Promise<[number, ListAdoptersDTO[]]> {
    const { name, cpf, email, phone, approvalStatus } = data
    const whereList: SQL[] = []

    if (name) {
      whereList.push(ilike(adopter.name, `%${name}%`))
    }

    if (cpf) {
      whereList.push(ilike(adopter.cpf, `%${cpf}%`))
    }

    if (email) {
      whereList.push(ilike(adopter.email, `%${email}%`))
    }

    if (phone) {
      whereList.push(ilike(adopter.phone, `%${phone}%`))
    }

    if (approvalStatus) {
      whereList.push(eq(adopter.approvalStatus, approvalStatus))
    }

    const [sqlQuery, countQuery] = querifyString(data, whereList, querifyStringSettings)

    const items = (await sqlQuery) as ListAdoptersDTO[]
    const [{ total }] = await countQuery

    return [total, items] as const
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<Adopter>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(adopter).where(eq(adopter.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: adopter.id,
        name: adopter.name,
        cpf: adopter.cpf,
        email: adopter.email,
        phone: adopter.phone,
        address: adopter.address,
        familyIncome: adopter.familyIncome,
        animalExperience: adopter.animalExperience,
        approvalStatus: adopter.approvalStatus,
        createdAt: adopter.createdAt,
        updatedAt: adopter.updatedAt,
      })
      .from(adopter)
      .where(eq(adopter.id, id))
      .limit(1)

    if (!first) {
      return null
    }

    return first
  }

  async findByIdOrThrow(id: number) {
    const [first] = await db
      .select({
        id: adopter.id,
        name: adopter.name,
        cpf: adopter.cpf,
        email: adopter.email,
        phone: adopter.phone,
        address: adopter.address,
        familyIncome: adopter.familyIncome,
        animalExperience: adopter.animalExperience,
        approvalStatus: adopter.approvalStatus,
        createdAt: adopter.createdAt,
        updatedAt: adopter.updatedAt,
      })
      .from(adopter)
      .where(eq(adopter.id, id))
      .limit(1)

    if (!first) {
      throw new ApiError('Adotante não encontrado.', 404)
    }

    return first
  }
}

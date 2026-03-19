import { db } from '@/database/client'
import { animal } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { Animal } from '@/entities'
import type { AnimalWithDetails, ListAnimalsData } from '@/use-cases/animal/list-animals/list-animals.dto'
import { ApiError } from '@/utils/api-error'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, eq, ilike } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: animal,
  initialOrderBy: animal.id,
  includes: [],
  customFields: {},
}

type AnimalSelectSchema = typeof animal.$inferSelect

export class AnimalRepository {
  create(data: Animal, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(animal).values(data).returning({ id: animal.id })
  }

  async update(id: number, data: Partial<Animal>, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection
      .update(animal)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(animal.id, id))
  }

  async list(data: ListAnimalsData) {
    const { name, species, breed, status, show } = data
    const whereList: SQL[] = []

    if (name) {
      whereList.push(ilike(animal.name, `%${name}%`))
    }

    if (species) {
      whereList.push(eq(animal.species, species))
    }

    if (breed) {
      whereList.push(ilike(animal.breed, `%${breed}%`))
    }

    if (status) {
      whereList.push(eq(animal.status, status))
    }

    if (show === 'enabled') {
      whereList.push(eq(animal.status, 'disponivel'))
    } else if (show === 'disabled') {
      whereList.push(eq(animal.status, 'adotado'))
    }

    const [sqlQuery, countQuery] = querifyString<AnimalWithDetails>(data, whereList, querifyStringSettings)

    const items = await sqlQuery
    const [{ total }] = await countQuery

    return [total, items] as const
  }

  async findById(id: number) {
    const [item] = await db.select().from(animal).where(eq(animal.id, id))

    if (!item) {
      return null
    }

    return item
  }

  async findByIdCustom<K extends keyof AnimalSelectSchema>(
    id: number,
    fields: K[],
    dbTransaction: DrizzleTransaction | null,
  ) {
    const connection = dbTransaction ?? db
    const selectFields = fields.reduce((acc, fieldName) => ({ ...acc, [fieldName]: animal[fieldName] }), {})
    const [item] = await connection.select(selectFields).from(animal).where(eq(animal.id, id)).limit(1)

    if (!item) {
      throw new ApiError('Animal não encontrado.', 404)
    }

    return item as Pick<AnimalSelectSchema, K>
  }

  async delete(id: number, dbTransaction: DrizzleTransaction | null = null) {
    const connection = dbTransaction ?? db
    await connection.delete(animal).where(eq(animal.id, id))
  }
}

import { db } from '@/database/client'
import { veterinaryClinic } from '@/database/schema'
import type { DrizzleTransaction } from '@/database/types'
import type { VeterinaryClinic } from '@/entities'
import type {
  ListVeterinaryClinicsDTO,
  ListVeterinaryClinicsData,
} from '@/use-cases/veterinary-clinic/list-veterinary-clinics/list-veterinary-clinics.dto'
import { ApiError } from '@/utils/api-error'
import type { ApiQuery } from '@/utils/drizzle/api-query-schema'
import { type QuerySettings, getPager, querify } from '@/utils/drizzle/querify'
import { type QueryStringSettings, querifyString } from '@/utils/drizzle/querify-string'
import { type SQL, eq, ilike } from 'drizzle-orm'

const querifyStringSettings: QueryStringSettings = {
  table: veterinaryClinic,
  initialOrderBy: veterinaryClinic.name,
}

const querifySettings: QuerySettings = {
  table: veterinaryClinic,
  initialOrderBy: veterinaryClinic.name,
}

export class VeterinaryClinicRepository {
  async create(data: VeterinaryClinic) {
    const [result] = await db.insert(veterinaryClinic).values(data).returning({ id: veterinaryClinic.id })

    return result
  }

  async update(id: number, data: Partial<VeterinaryClinic>) {
    await db.update(veterinaryClinic).set(data).where(eq(veterinaryClinic.id, id))
  }

  async list(data: ListVeterinaryClinicsData) {
    const { name, cnpj, phone, responsible, active } = data
    const whereList: SQL[] = []

    if (name) {
      whereList.push(ilike(veterinaryClinic.name, `%${name}%`))
    }

    if (cnpj) {
      whereList.push(ilike(veterinaryClinic.cnpj, `%${cnpj}%`))
    }

    if (phone) {
      whereList.push(ilike(veterinaryClinic.phone, `%${phone}%`))
    }

    if (responsible) {
      whereList.push(ilike(veterinaryClinic.responsible, `%${responsible}%`))
    }

    if (active) {
      whereList.push(eq(veterinaryClinic.active, active === 'true'))
    }

    const [sqlQuery, countQuery] = querifyString(data, whereList, querifyStringSettings)

    const items = (await sqlQuery) as ListVeterinaryClinicsDTO[]
    const [{ total }] = await countQuery

    return [total, items] as const
  }

  async listPost(query: ApiQuery) {
    const [sqlQuery, countQuery] = querify<VeterinaryClinic>(query, querifySettings)
    const [items, [{ total }]] = await Promise.all([sqlQuery, countQuery])
    return { items, pager: getPager(query, total) }
  }

  async remove(id: number, dbTransaction: DrizzleTransaction) {
    await dbTransaction.delete(veterinaryClinic).where(eq(veterinaryClinic.id, id))
  }

  async findById(id: number) {
    const [first] = await db
      .select({
        id: veterinaryClinic.id,
        name: veterinaryClinic.name,
        cnpj: veterinaryClinic.cnpj,
        phone: veterinaryClinic.phone,
        address: veterinaryClinic.address,
        responsible: veterinaryClinic.responsible,
        specialties: veterinaryClinic.specialties,
        active: veterinaryClinic.active,
        registrationDate: veterinaryClinic.registrationDate,
      })
      .from(veterinaryClinic)
      .where(eq(veterinaryClinic.id, id))
      .limit(1)

    if (!first) {
      return null
    }

    return first
  }

  async findByIdOrThrow(id: number) {
    const [first] = await db
      .select({
        id: veterinaryClinic.id,
        name: veterinaryClinic.name,
        cnpj: veterinaryClinic.cnpj,
        phone: veterinaryClinic.phone,
        address: veterinaryClinic.address,
        responsible: veterinaryClinic.responsible,
        specialties: veterinaryClinic.specialties,
        active: veterinaryClinic.active,
        registrationDate: veterinaryClinic.registrationDate,
      })
      .from(veterinaryClinic)
      .where(eq(veterinaryClinic.id, id))
      .limit(1)

    if (!first) {
      throw new ApiError('Clínica veterinária não encontrada.', 404)
    }

    return first
  }
}

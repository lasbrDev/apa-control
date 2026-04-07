import { db } from '@/database/client'
import { animalHistory, employee } from '@/database/schema'
import type { AnimalHistoryTypeValue } from '@/database/schema/enums/animal-history-type'
import type { DrizzleTransaction } from '@/database/types'
import type { AnimalHistory } from '@/entities'
import type { AnimalHistoryWithDetails } from '@/use-cases/animal-history/get-animal-history-by-id/get-animal-history-by-id.dto'
import { timeZoneName } from '@/utils/time-zone'
import { tz } from '@date-fns/tz'
import { endOfDay, parseISO, startOfDay } from 'date-fns'
import { and, desc, eq, gte, inArray, lte } from 'drizzle-orm'

type AnimalHistoryListFilter = {
  types?: AnimalHistoryTypeValue[]
  startDate?: string
  endDate?: string
  employeeId?: number
}

export class AnimalHistoryRepository {
  create(data: AnimalHistory, dbTransaction: DrizzleTransaction | null) {
    const connection = dbTransaction ?? db
    return connection.insert(animalHistory).values(data).returning({ id: animalHistory.id })
  }

  async listByAnimalId(animalId: number, filter?: AnimalHistoryListFilter): Promise<AnimalHistoryWithDetails[]> {
    const whereList = [eq(animalHistory.animalId, animalId)]

    if (filter?.types?.length) whereList.push(inArray(animalHistory.type, filter.types))
    if (filter?.startDate)
      whereList.push(
        gte(
          animalHistory.createdAt,
          startOfDay(parseISO(filter.startDate, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )
    if (filter?.endDate)
      whereList.push(
        lte(
          animalHistory.createdAt,
          endOfDay(parseISO(filter.endDate, { in: tz(timeZoneName.SP) }), { in: tz(timeZoneName.SP) }),
        ),
      )
    if (filter?.employeeId) whereList.push(eq(animalHistory.employeeId, filter.employeeId))

    const whereClause = whereList.length === 1 ? whereList[0] : and(...whereList)

    const items = await db
      .select({
        id: animalHistory.id,
        animalId: animalHistory.animalId,
        rescueId: animalHistory.rescueId,
        type: animalHistory.type,
        action: animalHistory.action,
        description: animalHistory.description,
        oldValue: animalHistory.oldValue,
        newValue: animalHistory.newValue,
        employeeId: animalHistory.employeeId,
        employeeName: employee.name,
        createdAt: animalHistory.createdAt,
      })
      .from(animalHistory)
      .leftJoin(employee, eq(employee.id, animalHistory.employeeId))
      .where(whereClause)
      .orderBy(desc(animalHistory.createdAt))

    return items as AnimalHistoryWithDetails[]
  }
}

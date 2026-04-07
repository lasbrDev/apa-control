import { boolean, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { decimalJs } from '../decimal-type'
import { procedureCategoryEnum } from './enums'

export const procedureType = pgTable('procedure_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  category: procedureCategoryEnum().notNull(),
  averageCost: decimalJs({ precision: 10, scale: 2 }).notNull(),
  active: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

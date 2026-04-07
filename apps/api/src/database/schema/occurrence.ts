import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { animal } from './animal'
import { employee } from './employee'
import { occurrenceType } from './occurrence-type'

export const occurrence = pgTable('occurrence', {
  id: serial().primaryKey(),
  animalId: integer()
    .notNull()
    .references(() => animal.id),
  occurrenceTypeId: integer()
    .notNull()
    .references(() => occurrenceType.id),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  occurrenceDate: timestamp({ withTimezone: true }).notNull(),
  description: text().notNull(),
  observations: text(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }),
})

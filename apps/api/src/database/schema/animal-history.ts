import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { animal } from './animal'
import { employee } from './employee'
import { animalHistoryTypeEnum } from './enums'

export const animalHistory = pgTable('animal_history', {
  id: serial().primaryKey(),
  animalId: integer()
    .notNull()
    .references(() => animal.id),
  rescueId: integer(),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  type: animalHistoryTypeEnum().notNull(),
  action: varchar({ length: 100 }).notNull(),
  description: text().notNull(),
  oldValue: text(),
  newValue: text(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { animal } from './animal'
import { employee } from './employee'

export const rescue = pgTable('rescue', {
  id: serial().primaryKey(),
  animalId: integer()
    .notNull()
    .references(() => animal.id),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  rescueDate: timestamp({ withTimezone: true }).notNull(),
  locationFound: varchar({ length: 200 }).notNull(),
  circumstances: text().notNull(),
  foundConditions: text().notNull(),
  immediateProcedures: text(),
  observations: text(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

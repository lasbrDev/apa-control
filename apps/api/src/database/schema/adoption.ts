import { date, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { adopter } from './adopter'
import { animal } from './animal'
import { employee } from './employee'
import { adoptionStatusEnum } from './enums'

export const adoption = pgTable('adoption', {
  id: serial().primaryKey(),
  animalId: integer()
    .notNull()
    .unique()
    .references(() => animal.id),
  adopterId: integer()
    .notNull()
    .references(() => adopter.id),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  adoptionDate: date().notNull(),
  adaptationPeriod: integer(),
  status: adoptionStatusEnum().notNull(),
  observations: text(),
  proof: varchar({ length: 255 }),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
})

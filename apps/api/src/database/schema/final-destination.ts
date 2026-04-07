import { date, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { animal } from './animal'
import { employee } from './employee'
import { finalDestinationType } from './final-destination-type'

export const finalDestination = pgTable('final_destination', {
  id: serial().primaryKey(),
  animalId: integer()
    .notNull()
    .unique()
    .references(() => animal.id),
  destinationTypeId: integer()
    .notNull()
    .references(() => finalDestinationType.id),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  destinationDate: date().notNull(),
  reason: text().notNull(),
  observations: text(),
  proof: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

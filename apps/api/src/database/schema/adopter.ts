import { boolean, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { decimalJs } from '../decimal-type'

export const adopter = pgTable('adopter', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  cpf: varchar({ length: 11 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }).notNull(),
  address: text().notNull(),
  familyIncome: decimalJs({ precision: 10, scale: 2 }).notNull(),
  animalExperience: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }),
})

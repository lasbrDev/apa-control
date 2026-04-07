import { boolean, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const veterinaryClinic = pgTable('veterinary_clinic', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  cnpj: varchar({ length: 14 }).notNull().unique(),
  phone: varchar({ length: 20 }).notNull(),
  address: text().notNull(),
  responsible: varchar({ length: 100 }).notNull(),
  specialties: text(),
  active: boolean().notNull().default(true),
  registrationDate: timestamp({ withTimezone: true }).notNull(),
})

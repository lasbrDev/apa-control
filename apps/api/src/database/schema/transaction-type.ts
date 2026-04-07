import { boolean, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { transactionCategoryEnum } from './enums'

export const transactionType = pgTable('transaction_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  category: transactionCategoryEnum().notNull(),
  description: text(),
  active: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

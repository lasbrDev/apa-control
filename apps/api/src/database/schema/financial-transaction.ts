import { date, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { decimalJs } from '../decimal-type'
import { animal } from './animal'
import { campaign } from './campaign'
import { employee } from './employee'
import { transactionStatusEnum } from './enums'
import { transactionType } from './transaction-type'

export const financialTransaction = pgTable('financial_transaction', {
  id: serial().primaryKey(),
  transactionTypeId: integer()
    .notNull()
    .references(() => transactionType.id),
  campaignId: integer().references(() => campaign.id),
  animalId: integer().references(() => animal.id),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  description: varchar({ length: 200 }).notNull(),
  value: decimalJs({ precision: 13, scale: 2 }).notNull(),
  proof: varchar({ length: 255 }),
  observations: text(),
  status: transactionStatusEnum().notNull(),
  paymentDate: date(),
  createdAt: timestamp().notNull(),
})

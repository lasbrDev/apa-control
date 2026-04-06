import { date, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { decimalJs } from '../decimal-type'
import { campaignType } from './campaign-type'
import { campaignStatusEnum } from './enums'

export const campaign = pgTable('campaign', {
  id: serial().primaryKey(),
  campaignTypeId: integer()
    .notNull()
    .references(() => campaignType.id),
  title: varchar({ length: 200 }).notNull(),
  description: text().notNull(),
  startDate: date().notNull(),
  endDate: date().notNull(),
  fundraisingGoal: decimalJs({ precision: 13, scale: 2 }),
  status: campaignStatusEnum().notNull(),
  observations: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
})

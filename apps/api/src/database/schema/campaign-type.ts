import { boolean, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const campaignType = pgTable('campaign_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  active: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

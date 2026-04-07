import { boolean, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { urgencyLevelEnum } from './enums'

export const appointmentType = pgTable('appointment_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  urgency: urgencyLevelEnum().notNull(),
  active: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

import { index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { appointment } from './appointment'
import { employee } from './employee'

export const appointmentReminder = pgTable(
  'appointment_reminder',
  {
    id: serial().primaryKey(),
    appointmentId: integer().references(() => appointment.id, { onDelete: 'set null' }),
    employeeId: integer()
      .notNull()
      .references(() => employee.id),
    title: varchar({ length: 255 }).notNull(),
    message: text().notNull(),
    readAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [index().on(table.employeeId, table.createdAt)],
)

import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { appointment } from './appointment'

export const anamnesis = pgTable('anamnesis', {
  id: serial().primaryKey(),
  appointmentId: integer()
    .notNull()
    .unique()
    .references(() => appointment.id),
  symptomsPresented: text(),
  dietaryHistory: text(),
  behavioralHistory: text(),
  requestedExams: text(),
  presumptiveDiagnosis: text(),
  observations: text(),
  proof: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

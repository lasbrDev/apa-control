import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { decimalJs } from '../decimal-type'
import { animal } from './animal'
import { appointment } from './appointment'
import { employee } from './employee'
import { procedureStatusEnum } from './enums'
import { procedureType } from './procedure-type'

export const clinicalProcedure = pgTable('clinical_procedure', {
  id: serial().primaryKey(),
  animalId: integer()
    .notNull()
    .references(() => animal.id),
  procedureTypeId: integer()
    .notNull()
    .references(() => procedureType.id),
  appointmentId: integer().references(() => appointment.id),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  procedureDate: timestamp({ withTimezone: true }).notNull(),
  description: text().notNull(),
  actualCost: decimalJs({ precision: 10, scale: 2 }).notNull(),
  observations: text(),
  status: procedureStatusEnum().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
})

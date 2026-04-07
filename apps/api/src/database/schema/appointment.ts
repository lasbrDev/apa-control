import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { animal } from './animal'
import { appointmentType } from './appointment-type'
import { employee } from './employee'
import { appointmentStatusEnum, consultationTypeEnum } from './enums'
import { veterinaryClinic } from './veterinary-clinic'

export const appointment = pgTable('appointment', {
  id: serial().primaryKey(),
  animalId: integer()
    .notNull()
    .references(() => animal.id),
  appointmentTypeId: integer()
    .notNull()
    .references(() => appointmentType.id),
  clinicId: integer().references(() => veterinaryClinic.id),
  employeeId: integer()
    .notNull()
    .references(() => employee.id),
  appointmentDate: timestamp({ withTimezone: true }).notNull(),
  consultationType: consultationTypeEnum().notNull(),
  status: appointmentStatusEnum().notNull(),
  observations: text(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }),
})

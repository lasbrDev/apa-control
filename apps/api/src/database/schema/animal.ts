import { date, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { animalStatusEnum, healthConditionEnum, sexEnum, sizeEnum, speciesEnum } from './enums'

export const animal = pgTable('animal', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  species: speciesEnum().notNull(),
  breed: varchar({ length: 50 }),
  size: sizeEnum().notNull(),
  sex: sexEnum().notNull(),
  birthYear: integer(),
  healthCondition: healthConditionEnum().notNull(),
  entryDate: date().notNull(),
  observations: text(),
  status: animalStatusEnum().notNull(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp(),
})

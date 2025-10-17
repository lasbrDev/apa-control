import { boolean, date, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import {
  AdoptionStatusValues,
  AnimalStatusValues,
  AppointmentStatusValues,
  ApprovalStatusValues,
  CampaignCategoryValues,
  CampaignStatusValues,
  ConsultationTypeValues,
  HealthConditionValues,
  PostStatusValues,
  PostTypeValues,
  ProcedureCategoryValues,
  ProcedureStatusValues,
  ProfileTypeValues,
  SexValues,
  SizeValues,
  SpeciesValues,
  TransactionCategoryValues,
  TransactionStatusValues,
  UrgencyLevelValues,
} from '../src/utils/enums'
import { decimalJs } from './decimalType'

// =====================================================
// ENUMS (PostgreSQL native enums)
// =====================================================

export const profileTypeEnum = pgEnum('profile_type', ProfileTypeValues)
export const procedureCategoryEnum = pgEnum('procedure_category', ProcedureCategoryValues)
export const transactionCategoryEnum = pgEnum('transaction_category', TransactionCategoryValues)
export const urgencyLevelEnum = pgEnum('urgency_level', UrgencyLevelValues)
export const campaignCategoryEnum = pgEnum('campaign_category', CampaignCategoryValues)
export const speciesEnum = pgEnum('species', SpeciesValues)
export const sizeEnum = pgEnum('size', SizeValues)
export const sexEnum = pgEnum('sex', SexValues)
export const healthConditionEnum = pgEnum('health_condition', HealthConditionValues)
export const animalStatusEnum = pgEnum('animal_status', AnimalStatusValues)
export const approvalStatusEnum = pgEnum('approval_status', ApprovalStatusValues)
export const campaignStatusEnum = pgEnum('campaign_status', CampaignStatusValues)
export const consultationTypeEnum = pgEnum('consultation_type', ConsultationTypeValues)
export const appointmentStatusEnum = pgEnum('appointment_status', AppointmentStatusValues)
export const procedureStatusEnum = pgEnum('procedure_status', ProcedureStatusValues)
export const adoptionStatusEnum = pgEnum('adoption_status', AdoptionStatusValues)
export const transactionStatusEnum = pgEnum('transaction_status', TransactionStatusValues)
export const postTypeEnum = pgEnum('post_type', PostTypeValues)
export const postStatusEnum = pgEnum('post_status', PostStatusValues)

export const accessProfile = pgTable('access_profile', {
  id: serial().primaryKey(),
  name: varchar({ length: 50 }).notNull().unique(),
  type: profileTypeEnum().notNull(),
  permissions: text().notNull(),
  created_at: timestamp().notNull(),
  updated_at: timestamp(),
})

export const procedureType = pgTable('procedure_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  category: procedureCategoryEnum().notNull(),
  average_cost: decimalJs({ precision: 10, scale: 2 }).notNull(),
  active: boolean().notNull().default(true),
  created_at: timestamp().notNull(),
})

export const transactionType = pgTable('transaction_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  category: transactionCategoryEnum().notNull(),
  description: text(),
  active: boolean().notNull().default(true),
  created_at: timestamp().notNull(),
})

export const appointmentType = pgTable('appointment_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  urgency: urgencyLevelEnum().notNull(),
  active: boolean().notNull().default(true),
  created_at: timestamp().notNull(),
})

export const finalDestinationType = pgTable('final_destination_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  requires_approval: boolean().notNull().default(false),
  active: boolean().notNull().default(true),
  created_at: timestamp().notNull(),
})

export const campaignType = pgTable('campaign_type', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  category: campaignCategoryEnum().notNull(),
  active: boolean().notNull().default(true),
  created_at: timestamp().notNull(),
})

export const user = pgTable('user', {
  id: serial().primaryKey(),
  profile_id: integer()
    .notNull()
    .references(() => accessProfile.id),
  name: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }).notNull(),
  registration_date: timestamp().notNull(),
  dismissal_date: timestamp(),
  active: boolean().notNull().default(true),
  observations: text(),
})

export const veterinaryClinic = pgTable('veterinary_clinic', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  cnpj: varchar({ length: 14 }).notNull().unique(),
  phone: varchar({ length: 20 }).notNull(),
  address: text().notNull(),
  responsible: varchar({ length: 100 }).notNull(),
  specialties: text(),
  active: boolean().notNull().default(true),
  registration_date: timestamp().notNull(),
})

export const animal = pgTable('animal', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  species: speciesEnum().notNull(),
  breed: varchar({ length: 50 }),
  size: sizeEnum().notNull(),
  sex: sexEnum().notNull(),
  age: integer().notNull(),
  health_condition: healthConditionEnum().notNull(),
  entry_date: date().notNull(),
  observations: text(),
  status: animalStatusEnum().notNull(),
  created_at: timestamp().notNull(),
  updated_at: timestamp(),
})

export const adopter = pgTable('adopter', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  cpf: varchar({ length: 11 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }).notNull(),
  address: text().notNull(),
  family_income: decimalJs({ precision: 10, scale: 2 }).notNull(),
  animal_experience: boolean().notNull().default(false),
  approval_status: approvalStatusEnum().notNull(),
  created_at: timestamp().notNull(),
  updated_at: timestamp(),
})

export const campaign = pgTable('campaign', {
  id: serial().primaryKey(),
  campaign_type_id: integer()
    .notNull()
    .references(() => campaignType.id),
  title: varchar({ length: 200 }).notNull(),
  description: text().notNull(),
  start_date: date().notNull(),
  end_date: date().notNull(),
  fundraising_goal: decimalJs({ precision: 13, scale: 2 }).notNull(),
  status: campaignStatusEnum().notNull(),
  observations: text(),
  created_at: timestamp().notNull(),
  updated_at: timestamp(),
})

export const rescue = pgTable('rescue', {
  id: serial().primaryKey(),
  animal_id: integer()
    .notNull()
    .references(() => animal.id),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  rescue_date: timestamp().notNull(),
  location_found: varchar({ length: 200 }).notNull(),
  circumstances: text().notNull(),
  found_conditions: text().notNull(),
  immediate_procedures: text(),
  observations: text(),
  created_at: timestamp().notNull(),
})

export const appointment = pgTable('appointment', {
  id: serial().primaryKey(),
  animal_id: integer()
    .notNull()
    .references(() => animal.id),
  appointment_type_id: integer()
    .notNull()
    .references(() => appointmentType.id),
  clinic_id: integer().references(() => veterinaryClinic.id),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  appointment_date: timestamp().notNull(),
  consultation_type: consultationTypeEnum().notNull(),
  status: appointmentStatusEnum().notNull(),
  observations: text(),
  created_at: timestamp().notNull(),
  updated_at: timestamp(),
})

export const anamnesis = pgTable('anamnesis', {
  id: serial().primaryKey(),
  appointment_id: integer()
    .notNull()
    .unique()
    .references(() => appointment.id),
  symptoms_presented: text().notNull(),
  dietary_history: text(),
  behavioral_history: text(),
  requested_exams: text(),
  presumptive_diagnosis: text(),
  observations: text(),
  created_at: timestamp().notNull(),
})

export const clinicalProcedure = pgTable('clinical_procedure', {
  id: serial().primaryKey(),
  animal_id: integer()
    .notNull()
    .references(() => animal.id),
  procedure_type_id: integer()
    .notNull()
    .references(() => procedureType.id),
  appointment_id: integer().references(() => appointment.id),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  procedure_date: timestamp().notNull(),
  description: text().notNull(),
  actual_cost: decimalJs({ precision: 10, scale: 2 }).notNull(),
  observations: text(),
  status: procedureStatusEnum().notNull(),
  created_at: timestamp().notNull(),
})

export const adoption = pgTable('adoption', {
  id: serial().primaryKey(),
  animal_id: integer()
    .notNull()
    .unique()
    .references(() => animal.id),
  adopter_id: integer()
    .notNull()
    .references(() => adopter.id),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  adoption_date: date().notNull(),
  term_signed: boolean().notNull().default(false),
  adaptation_period: integer(),
  status: adoptionStatusEnum().notNull(),
  observations: text(),
  created_at: timestamp().notNull(),
  updated_at: timestamp(),
})

export const finalDestination = pgTable('final_destination', {
  id: serial().primaryKey(),
  animal_id: integer()
    .notNull()
    .unique()
    .references(() => animal.id),
  destination_type_id: integer()
    .notNull()
    .references(() => finalDestinationType.id),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  destination_date: date().notNull(),
  reason: text().notNull(),
  observations: text(),
  proof: varchar({ length: 255 }),
  created_at: timestamp().notNull(),
})

export const financialTransaction = pgTable('financial_transaction', {
  id: serial().primaryKey(),
  transaction_type_id: integer()
    .notNull()
    .references(() => transactionType.id),
  campaign_id: integer().references(() => campaign.id),
  animal_id: integer().references(() => animal.id),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  description: varchar({ length: 200 }).notNull(),
  value: decimalJs({ precision: 13, scale: 2 }).notNull(),
  transaction_date: date().notNull(),
  proof: varchar({ length: 255 }),
  observations: text(),
  status: transactionStatusEnum().notNull(),
  created_at: timestamp().notNull(),
})

export const post = pgTable('post', {
  id: serial().primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => user.id),
  title: varchar({ length: 200 }).notNull(),
  content: text().notNull(),
  type: postTypeEnum().notNull(),
  publication_date: timestamp().notNull(),
  status: postStatusEnum().notNull(),
  related_animals: text(),
  created_at: timestamp().notNull(),
  updated_at: timestamp(),
})

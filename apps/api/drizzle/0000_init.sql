CREATE TYPE "public"."adoption_status" AS ENUM('processando', 'concluida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."animal_status" AS ENUM('disponivel', 'em_tratamento', 'adotado');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('agendado', 'realizado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pendente', 'aprovado', 'reprovado');--> statement-breakpoint
CREATE TYPE "public"."campaign_category" AS ENUM('doacao', 'rifa', 'evento', 'patrocinio');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('ativa', 'concluida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."consultation_type" AS ENUM('clinica', 'domiciliar', 'emergencia');--> statement-breakpoint
CREATE TYPE "public"."health_condition" AS ENUM('critica', 'estavel', 'saudavel');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('rascunho', 'publicado', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('adocao', 'campanha', 'comunicado');--> statement-breakpoint
CREATE TYPE "public"."procedure_category" AS ENUM('clinico', 'cirurgico', 'exame', 'vacina');--> statement-breakpoint
CREATE TYPE "public"."procedure_status" AS ENUM('agendado', 'realizado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."profile_type" AS ENUM('administrador', 'atendente');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('macho', 'femea');--> statement-breakpoint
CREATE TYPE "public"."size" AS ENUM('pequeno', 'medio', 'grande');--> statement-breakpoint
CREATE TYPE "public"."species" AS ENUM('canina', 'felina', 'outros');--> statement-breakpoint
CREATE TYPE "public"."transaction_category" AS ENUM('receita', 'despesa');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pendente', 'confirmado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."urgency_level" AS ENUM('rotina', 'urgente', 'emergencia');--> statement-breakpoint
CREATE TABLE "access_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"type" "profile_type" NOT NULL,
	"permissions" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "access_profile_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "adopter" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"family_income" decimal(10, 2) NOT NULL,
	"animal_experience" boolean DEFAULT false NOT NULL,
	"approval_status" "approval_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "adopter_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "adoption" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"adopter_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"adoption_date" date NOT NULL,
	"term_signed" boolean DEFAULT false NOT NULL,
	"adaptation_period" integer,
	"status" "adoption_status" NOT NULL,
	"observations" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "adoption_animal_id_unique" UNIQUE("animal_id")
);
--> statement-breakpoint
CREATE TABLE "anamnesis" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer NOT NULL,
	"symptoms_presented" text NOT NULL,
	"dietary_history" text,
	"behavioral_history" text,
	"requested_exams" text,
	"presumptive_diagnosis" text,
	"observations" text,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "anamnesis_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "animal" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"species" "species" NOT NULL,
	"breed" varchar(50),
	"size" "size" NOT NULL,
	"sex" "sex" NOT NULL,
	"age" integer NOT NULL,
	"health_condition" "health_condition" NOT NULL,
	"entry_date" date NOT NULL,
	"observations" text,
	"status" "animal_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"appointment_type_id" integer NOT NULL,
	"clinic_id" integer,
	"user_id" integer NOT NULL,
	"appointment_date" timestamp NOT NULL,
	"consultation_type" "consultation_type" NOT NULL,
	"status" "appointment_status" NOT NULL,
	"observations" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "appointment_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"urgency" "urgency_level" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "appointment_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "campaign" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_type_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"fundraising_goal" decimal(13, 2) NOT NULL,
	"status" "campaign_status" NOT NULL,
	"observations" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaign_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" "campaign_category" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "campaign_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "clinical_procedure" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"procedure_type_id" integer NOT NULL,
	"appointment_id" integer,
	"user_id" integer NOT NULL,
	"procedure_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"actual_cost" decimal(10, 2) NOT NULL,
	"observations" text,
	"status" "procedure_status" NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "final_destination" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"destination_type_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"destination_date" date NOT NULL,
	"reason" text NOT NULL,
	"observations" text,
	"proof" varchar(255),
	"created_at" timestamp NOT NULL,
	CONSTRAINT "final_destination_animal_id_unique" UNIQUE("animal_id")
);
--> statement-breakpoint
CREATE TABLE "final_destination_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "final_destination_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "financial_transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_type_id" integer NOT NULL,
	"campaign_id" integer,
	"animal_id" integer,
	"user_id" integer NOT NULL,
	"description" varchar(200) NOT NULL,
	"value" decimal(13, 2) NOT NULL,
	"transaction_date" date NOT NULL,
	"proof" varchar(255),
	"observations" text,
	"status" "transaction_status" NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"type" "post_type" NOT NULL,
	"publication_date" timestamp NOT NULL,
	"status" "post_status" NOT NULL,
	"related_animals" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "procedure_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" "procedure_category" NOT NULL,
	"average_cost" decimal(10, 2) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "procedure_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "rescue" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rescue_date" timestamp NOT NULL,
	"location_found" varchar(200) NOT NULL,
	"circumstances" text NOT NULL,
	"found_conditions" text NOT NULL,
	"immediate_procedures" text,
	"observations" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" "transaction_category" NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "transaction_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"registration_date" timestamp NOT NULL,
	"dismissal_date" timestamp,
	"active" boolean DEFAULT true NOT NULL,
	"observations" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "veterinary_clinic" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"cnpj" varchar(14) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"responsible" varchar(100) NOT NULL,
	"specialties" text,
	"active" boolean DEFAULT true NOT NULL,
	"registration_date" timestamp NOT NULL,
	CONSTRAINT "veterinary_clinic_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
ALTER TABLE "adoption" ADD CONSTRAINT "adoption_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption" ADD CONSTRAINT "adoption_adopter_id_adopter_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."adopter"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption" ADD CONSTRAINT "adoption_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anamnesis" ADD CONSTRAINT "anamnesis_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_appointment_type_id_appointment_type_id_fk" FOREIGN KEY ("appointment_type_id") REFERENCES "public"."appointment_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_clinic_id_veterinary_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."veterinary_clinic"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_campaign_type_id_campaign_type_id_fk" FOREIGN KEY ("campaign_type_id") REFERENCES "public"."campaign_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_procedure" ADD CONSTRAINT "clinical_procedure_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_procedure" ADD CONSTRAINT "clinical_procedure_procedure_type_id_procedure_type_id_fk" FOREIGN KEY ("procedure_type_id") REFERENCES "public"."procedure_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_procedure" ADD CONSTRAINT "clinical_procedure_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_procedure" ADD CONSTRAINT "clinical_procedure_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_destination" ADD CONSTRAINT "final_destination_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_destination" ADD CONSTRAINT "final_destination_destination_type_id_final_destination_type_id_fk" FOREIGN KEY ("destination_type_id") REFERENCES "public"."final_destination_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_destination" ADD CONSTRAINT "final_destination_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_transaction_type_id_transaction_type_id_fk" FOREIGN KEY ("transaction_type_id") REFERENCES "public"."transaction_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue" ADD CONSTRAINT "rescue_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue" ADD CONSTRAINT "rescue_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_profile_id_access_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."access_profile"("id") ON DELETE no action ON UPDATE no action;
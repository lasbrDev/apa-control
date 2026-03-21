ALTER TYPE "public"."animal_history_type" ADD VALUE 'ocorrencia' BEFORE 'destino_final';--> statement-breakpoint
CREATE TABLE "occurrence" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"occurrence_type_id" integer NOT NULL,
	"employee_id" integer NOT NULL,
	"occurrence_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"observations" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "occurrence_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "occurrence_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "occurrence" ADD CONSTRAINT "occurrence_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence" ADD CONSTRAINT "occurrence_occurrence_type_id_occurrence_type_id_fk" FOREIGN KEY ("occurrence_type_id") REFERENCES "public"."occurrence_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrence" ADD CONSTRAINT "occurrence_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE no action ON UPDATE no action;
CREATE TYPE "public"."animal_history_type" AS ENUM('resgate', 'cadastro', 'consulta', 'procedimento', 'destino_final');--> statement-breakpoint
CREATE TABLE "animal_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" integer NOT NULL,
	"rescue_id" integer,
	"employee_id" integer NOT NULL,
	"type" "animal_history_type" NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"old_value" text NOT NULL,
	"new_value" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "animal_history" ADD CONSTRAINT "animal_history_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_history" ADD CONSTRAINT "animal_history_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE no action ON UPDATE no action;
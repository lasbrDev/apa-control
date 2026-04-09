CREATE TABLE "appointment_reminder" (
	"id" serial PRIMARY KEY NOT NULL,
	"appointment_id" integer,
	"employee_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointment_reminder" ADD CONSTRAINT "appointment_reminder_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_reminder" ADD CONSTRAINT "appointment_reminder_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointment_reminder_employee_id_created_at_index" ON "appointment_reminder" USING btree ("employee_id","created_at");
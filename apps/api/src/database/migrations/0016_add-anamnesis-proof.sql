ALTER TABLE "anamnesis" ALTER COLUMN "symptoms_presented" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "anamnesis" ADD COLUMN "proof" varchar(255);
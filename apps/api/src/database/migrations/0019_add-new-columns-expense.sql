ALTER TABLE "financial_transaction" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transaction_status";--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pendente', 'confirmado', 'estornado');--> statement-breakpoint
ALTER TABLE "financial_transaction" ALTER COLUMN "status" SET DATA TYPE "public"."transaction_status" USING "status"::"public"."transaction_status";--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "due_date" date;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "reversal_date" date;
ALTER TYPE "public"."animal_history_type" ADD VALUE 'despesa';--> statement-breakpoint
ALTER TYPE "public"."animal_history_type" ADD VALUE 'receita';--> statement-breakpoint
ALTER TABLE "animal_history" ALTER COLUMN "old_value" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "animal_history" ALTER COLUMN "new_value" DROP NOT NULL;
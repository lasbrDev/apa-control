ALTER TABLE "financial_transaction" ADD COLUMN "payment_date" date;--> statement-breakpoint
ALTER TABLE "financial_transaction" DROP COLUMN "transaction_date";
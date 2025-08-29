-- AlterEnum
ALTER TYPE "public"."PaymentStatus" ADD VALUE 'AWAITING_CONFIRMATION';

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "size_label" TEXT;

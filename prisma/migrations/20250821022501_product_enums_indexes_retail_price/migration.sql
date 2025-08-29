/*
  Warnings:

  - The `condition` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `order` on table `ProductImage` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProductCondition" AS ENUM ('NEW_WITH_TAGS', 'LIKE_NEW', 'GREAT', 'GOOD', 'FAIR');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "retailPrice" INTEGER,
DROP COLUMN "condition",
ADD COLUMN     "condition" "public"."ProductCondition",
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."ProductImage" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "order" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Cart_anonId_idx" ON "public"."Cart"("anonId");

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "public"."Cart"("userId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "public"."Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Product_status_createdAt_idx" ON "public"."Product"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_status_price_idx" ON "public"."Product"("status", "price");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "public"."Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "public"."Product"("categoryId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_order_idx" ON "public"."ProductImage"("productId", "order");

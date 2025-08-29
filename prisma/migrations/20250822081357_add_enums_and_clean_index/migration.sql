/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `DiscountCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENT', 'AMOUNT');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."DiscountCode" DROP COLUMN "type",
ADD COLUMN     "type" "public"."DiscountType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "status",
ADD COLUMN     "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "conditionDescription" TEXT,
ADD COLUMN     "conditionLabel" TEXT,
ADD COLUMN     "conditionValue" TEXT,
ADD COLUMN     "ecoGlassesOfWater" DOUBLE PRECISION,
ADD COLUMN     "ecoHoursOfLighting" DOUBLE PRECISION,
ADD COLUMN     "ecoImpactGroup" TEXT,
ADD COLUMN     "ecoKmsOfDriving" DOUBLE PRECISION,
ADD COLUMN     "estimatedPriceSource" TEXT,
ADD COLUMN     "favoritesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "productTypeId" TEXT,
ADD COLUMN     "sizeOptionId" TEXT;

-- AlterTable
ALTER TABLE "public"."ProductImage" ADD COLUMN     "alt" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "thumb" TEXT;

-- CreateTable
CREATE TABLE "public"."ProductType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameVi" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SizeOption" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "sizeLabel" TEXT NOT NULL,
    "us" TEXT,
    "uk" TEXT,
    "kr" TEXT,
    "jp" TEXT,
    "eu" TEXT,

    CONSTRAINT "SizeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EcoImpact" (
    "id" TEXT NOT NULL,
    "productGroup" TEXT NOT NULL,
    "glassesOfWater" DOUBLE PRECISION NOT NULL,
    "hoursOfLighting" DOUBLE PRECISION NOT NULL,
    "kmsOfDriving" DOUBLE PRECISION NOT NULL,
    "productTypeId" TEXT,

    CONSTRAINT "EcoImpact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductType_name_key" ON "public"."ProductType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SizeOption_sizeLabel_sortOrder_key" ON "public"."SizeOption"("sizeLabel", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EcoImpact_productGroup_key" ON "public"."EcoImpact"("productGroup");

-- CreateIndex
CREATE UNIQUE INDEX "EcoImpact_productTypeId_key" ON "public"."EcoImpact"("productTypeId");

-- CreateIndex
CREATE INDEX "Product_productTypeId_idx" ON "public"."Product"("productTypeId");

-- CreateIndex
CREATE INDEX "Product_sizeOptionId_idx" ON "public"."Product"("sizeOptionId");

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "public"."ProductType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_sizeOptionId_fkey" FOREIGN KEY ("sizeOptionId") REFERENCES "public"."SizeOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductType" ADD CONSTRAINT "ProductType_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."ProductType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EcoImpact" ADD CONSTRAINT "EcoImpact_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "public"."ProductType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

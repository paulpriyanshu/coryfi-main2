/*
  Warnings:

  - A unique constraint covering the columns `[productAId,productBId,relationType]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProductVariant_productAId_productBId_key";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "description" TEXT,
ADD COLUMN     "relationType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productAId_productBId_relationType_key" ON "ProductVariant"("productAId", "productBId", "relationType");

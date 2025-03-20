/*
  Warnings:

  - You are about to drop the column `businessId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[businessPageLayoutId]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId]` on the table `BusinessPageLayout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessId` to the `BusinessPageLayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BusinessPageLayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessPageId` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_businessId_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "businessPageLayoutId" INTEGER;

-- AlterTable
ALTER TABLE "BusinessPageLayout" ADD COLUMN     "businessId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "businessId",
ADD COLUMN     "businessPageId" INTEGER;

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "businessId",
ADD COLUMN     "businessPageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "businessId",
ADD COLUMN     "businessPageId" INTEGER;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "businessId",
ADD COLUMN     "businessPageId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Business_businessPageLayoutId_key" ON "Business"("businessPageLayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPageLayout_businessId_key" ON "BusinessPageLayout"("businessId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPageLayout" ADD CONSTRAINT "BusinessPageLayout_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

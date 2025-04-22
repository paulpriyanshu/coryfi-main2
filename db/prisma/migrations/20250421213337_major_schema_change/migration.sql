/*
  Warnings:

  - You are about to drop the column `businessId` on the `BusinessPageLayout` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BusinessPageLayout" DROP CONSTRAINT "BusinessPageLayout_businessId_fkey";

-- DropIndex
DROP INDEX "BusinessPageLayout_businessId_idx";

-- AlterTable
ALTER TABLE "BusinessPageLayout" DROP COLUMN "businessId";

-- CreateTable
CREATE TABLE "BusinessToPageLayout" (
    "id" SERIAL NOT NULL,
    "businessId" TEXT NOT NULL,
    "businessPageLayoutId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessToPageLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessToPageLayout_businessId_idx" ON "BusinessToPageLayout"("businessId");

-- CreateIndex
CREATE INDEX "BusinessToPageLayout_businessPageLayoutId_idx" ON "BusinessToPageLayout"("businessPageLayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessToPageLayout_businessId_businessPageLayoutId_key" ON "BusinessToPageLayout"("businessId", "businessPageLayoutId");

-- CreateIndex
CREATE INDEX "BusinessPageLayout_pageId_idx" ON "BusinessPageLayout"("pageId");

-- AddForeignKey
ALTER TABLE "BusinessToPageLayout" ADD CONSTRAINT "BusinessToPageLayout_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("Business_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessToPageLayout" ADD CONSTRAINT "BusinessToPageLayout_businessPageLayoutId_fkey" FOREIGN KEY ("businessPageLayoutId") REFERENCES "BusinessPageLayout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

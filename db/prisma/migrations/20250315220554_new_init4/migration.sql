/*
  Warnings:

  - You are about to drop the column `businessId` on the `CategoryCarousel` table. All the data in the column will be lost.
  - Added the required column `businessPageId` to the `CategoryCarousel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoryCarousel" DROP CONSTRAINT "CategoryCarousel_businessId_fkey";

-- AlterTable
ALTER TABLE "CategoryCarousel" DROP COLUMN "businessId",
ADD COLUMN     "businessPageId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CategoryCarousel" ADD CONSTRAINT "CategoryCarousel_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE CASCADE ON UPDATE CASCADE;

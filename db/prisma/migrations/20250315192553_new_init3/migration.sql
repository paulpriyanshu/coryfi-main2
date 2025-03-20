/*
  Warnings:

  - You are about to drop the column `businessPageId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_businessPageId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryCarousel" DROP CONSTRAINT "CategoryCarousel_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_businessPageId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_businessPageId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_businessPageId_fkey";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "businessPageId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CategoryCarousel" ALTER COLUMN "businessId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Offer" ALTER COLUMN "businessPageId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "businessPageId";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "businessPageId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryCarousel" ADD CONSTRAINT "CategoryCarousel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `businessPageLayoutId` on the `Business` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BusinessPageLayout" DROP CONSTRAINT "BusinessPageLayout_businessId_fkey";

-- DropIndex
DROP INDEX "Business_businessPageLayoutId_key";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "businessPageLayoutId";

-- AlterTable
ALTER TABLE "BusinessPageLayout" ALTER COLUMN "name" SET DEFAULT 'Page Name',
ALTER COLUMN "businessId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "BusinessPageLayout" ADD CONSTRAINT "BusinessPageLayout_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("Business_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

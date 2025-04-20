-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_businessId_fkey";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "businessId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE RESTRICT ON UPDATE CASCADE;

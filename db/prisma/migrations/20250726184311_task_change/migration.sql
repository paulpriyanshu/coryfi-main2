-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "businessId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE SET NULL ON UPDATE CASCADE;

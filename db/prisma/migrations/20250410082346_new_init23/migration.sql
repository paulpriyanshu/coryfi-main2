-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_jobId_fkey";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "jobId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

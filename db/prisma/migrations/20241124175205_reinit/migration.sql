-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "approvedBy" TEXT[],
ADD COLUMN     "intermediaries" TEXT[],
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'INTERMEDIARY',
ALTER COLUMN "status" SET DEFAULT 'PENDING';

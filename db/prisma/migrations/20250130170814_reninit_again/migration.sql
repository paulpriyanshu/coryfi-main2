-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('accepted', 'rejected', 'pending');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "status" "STATUS";

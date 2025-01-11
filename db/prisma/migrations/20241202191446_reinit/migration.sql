/*
  Warnings:

  - You are about to drop the column `evaluationId` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `initiatorId` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `pathWorkedId` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Connection` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_pathWorkedId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_receiverId_fkey";

-- DropIndex
DROP INDEX "Connection_initiatorId_receiverId_key";

-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "evaluationId",
DROP COLUMN "initiatorId",
DROP COLUMN "pathWorkedId",
DROP COLUMN "receiverId",
ADD COLUMN     "evaluationIds" INTEGER[],
ADD COLUMN     "evaluationWorked" INTEGER,
ADD COLUMN     "recipientId" INTEGER NOT NULL,
ADD COLUMN     "requesterId" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

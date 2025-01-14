/*
  Warnings:

  - A unique constraint covering the columns `[requesterId,recipientId,createdAt]` on the table `EvaluationApprovals` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EvaluationApprovals_requesterId_recipientId_key";

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationApprovals_requesterId_recipientId_createdAt_key" ON "EvaluationApprovals"("requesterId", "recipientId", "createdAt");

/*
  Warnings:

  - A unique constraint covering the columns `[requesterId,recipientId,createdAt]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Connection_requesterId_recipientId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Connection_requesterId_recipientId_createdAt_key" ON "Connection"("requesterId", "recipientId", "createdAt");

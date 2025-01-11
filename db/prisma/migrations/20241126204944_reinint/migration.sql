/*
  Warnings:

  - You are about to drop the column `approvedBy` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `intermediaries` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `Connection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "approvedBy",
DROP COLUMN "intermediaries",
DROP COLUMN "stage",
ALTER COLUMN "status" DROP DEFAULT;

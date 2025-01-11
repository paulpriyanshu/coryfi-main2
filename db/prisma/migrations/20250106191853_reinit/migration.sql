/*
  Warnings:

  - You are about to drop the column `evaluationIds` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `evaluationWorked` on the `Connection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "evaluationIds",
DROP COLUMN "evaluationWorked",
ADD COLUMN     "StrengthLevel" INTEGER;

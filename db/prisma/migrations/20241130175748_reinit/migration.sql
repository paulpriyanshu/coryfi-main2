/*
  Warnings:

  - The primary key for the `Evaluation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Evaluation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Path` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Path` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `requesterId` on the `Evaluation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recipientId` on the `Evaluation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `evaluationId` on the `Path` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `intermediaryId` on the `Path` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "Path" DROP CONSTRAINT "Path_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "Path" DROP CONSTRAINT "Path_intermediaryId_fkey";

-- AlterTable
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "requesterId",
ADD COLUMN     "requesterId" INTEGER NOT NULL,
DROP COLUMN "recipientId",
ADD COLUMN     "recipientId" INTEGER NOT NULL,
ADD CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Path" DROP CONSTRAINT "Path_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "evaluationId",
ADD COLUMN     "evaluationId" INTEGER NOT NULL,
DROP COLUMN "intermediaryId",
ADD COLUMN     "intermediaryId" INTEGER NOT NULL,
ADD CONSTRAINT "Path_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Path_evaluationId_intermediaryId_key" ON "Path"("evaluationId", "intermediaryId");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Path" ADD CONSTRAINT "Path_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Path" ADD CONSTRAINT "Path_intermediaryId_fkey" FOREIGN KEY ("intermediaryId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

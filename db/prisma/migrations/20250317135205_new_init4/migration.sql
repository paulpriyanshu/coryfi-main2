/*
  Warnings:

  - You are about to drop the column `type` on the `BusinessPageLayout` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessPageLayout" DROP COLUMN "type",
ADD COLUMN     "category" TEXT;

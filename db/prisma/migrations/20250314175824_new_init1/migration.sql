/*
  Warnings:

  - A unique constraint covering the columns `[pageId]` on the table `BusinessPageLayout` will be added. If there are existing duplicate values, this will fail.
  - The required column `pageId` was added to the `BusinessPageLayout` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "BusinessPageLayout" ADD COLUMN     "pageId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPageLayout_pageId_key" ON "BusinessPageLayout"("pageId");

/*
  Warnings:

  - You are about to drop the column `fields` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "fields",
ADD COLUMN     "details" JSONB;

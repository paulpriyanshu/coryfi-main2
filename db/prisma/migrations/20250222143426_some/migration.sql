/*
  Warnings:

  - You are about to drop the column `price` on the `Variant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "price",
ALTER COLUMN "stock" DROP NOT NULL;

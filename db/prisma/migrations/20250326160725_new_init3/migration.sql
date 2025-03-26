/*
  Warnings:

  - You are about to drop the column `key` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Field` table. All the data in the column will be lost.
  - Added the required column `keyValues` to the `Field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Field` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Field" DROP COLUMN "key",
DROP COLUMN "value",
ADD COLUMN     "keyValues" JSONB NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

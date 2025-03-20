/*
  Warnings:

  - The `value` column on the `Fields` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Fields" DROP COLUMN "value",
ADD COLUMN     "value" TEXT[];

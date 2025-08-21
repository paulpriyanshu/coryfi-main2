/*
  Warnings:

  - The `PageAlertsBeforeCart` column on the `BusinessPageLayout` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BusinessPageLayout" DROP COLUMN "PageAlertsBeforeCart",
ADD COLUMN     "PageAlertsBeforeCart" JSONB;

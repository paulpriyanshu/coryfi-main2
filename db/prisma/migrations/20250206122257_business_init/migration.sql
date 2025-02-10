/*
  Warnings:

  - The `adharRegisteredNumber` column on the `Merchant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `ownerPhoneNumber` on the `Merchant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `adharNumber` on the `Merchant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Merchant" DROP COLUMN "ownerPhoneNumber",
ADD COLUMN     "ownerPhoneNumber" INTEGER NOT NULL,
DROP COLUMN "adharNumber",
ADD COLUMN     "adharNumber" INTEGER NOT NULL,
DROP COLUMN "adharRegisteredNumber",
ADD COLUMN     "adharRegisteredNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_adharNumber_key" ON "Merchant"("adharNumber");

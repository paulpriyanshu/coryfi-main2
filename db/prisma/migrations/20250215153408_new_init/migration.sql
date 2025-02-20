/*
  Warnings:

  - You are about to drop the column `Operational_Since` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `discountedPrice` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "Operational_Since";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "discountedPrice",
ADD COLUMN     "BeforeDiscountPrice" DOUBLE PRECISION;

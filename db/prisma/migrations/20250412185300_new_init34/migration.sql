/*
  Warnings:

  - You are about to drop the column `OTP` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "OTP";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "otp",
ADD COLUMN     "OTP" TEXT;

/*
  Warnings:

  - You are about to drop the column `payoutId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_payoutId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "payoutId";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "payoutId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("payout_id") ON DELETE SET NULL ON UPDATE CASCADE;

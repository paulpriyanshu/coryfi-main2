-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_order_id_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "payoutId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("payout_id") ON DELETE SET NULL ON UPDATE CASCADE;

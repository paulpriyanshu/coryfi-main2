/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_id` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "order_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Business_merchantId_Business_Id_idx" ON "Business"("merchantId", "Business_Id");

-- CreateIndex
CREATE INDEX "Business_Business_Id_idx" ON "Business"("Business_Id");

-- CreateIndex
CREATE INDEX "BusinessPageLayout_businessId_idx" ON "BusinessPageLayout"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_id_key" ON "Order"("order_id");

-- CreateIndex
CREATE INDEX "Order_order_id_idx" ON "Order"("order_id");

-- CreateIndex
CREATE INDEX "Transaction_transactionId_idx" ON "Transaction"("transactionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

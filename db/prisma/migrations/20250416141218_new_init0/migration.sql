/*
  Warnings:

  - A unique constraint covering the columns `[payout_id]` on the table `Payout` will be added. If there are existing duplicate values, this will fail.
  - The required column `payout_id` was added to the `Payout` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "payout_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payout_payout_id_key" ON "Payout"("payout_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Payout"("payout_id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The `address` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "address",
ADD COLUMN     "address" JSONB;

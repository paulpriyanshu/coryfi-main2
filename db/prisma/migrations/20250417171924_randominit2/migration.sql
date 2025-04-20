-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "outForDelivery" TEXT DEFAULT 'FALSE';

-- AlterTable
ALTER TABLE "Payout" ALTER COLUMN "status" SET DEFAULT 'PENDING';

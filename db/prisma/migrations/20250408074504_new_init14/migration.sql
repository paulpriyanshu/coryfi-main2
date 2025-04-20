-- CreateEnum
CREATE TYPE "RecieveBy" AS ENUM ('DELIVERY', 'DINEIN', 'TAKEAWAY');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deliveryCharge" DOUBLE PRECISION,
ADD COLUMN     "dineinCharge" DOUBLE PRECISION,
ADD COLUMN     "recieveBy" "RecieveBy",
ADD COLUMN     "takeawayCharge" DOUBLE PRECISION;

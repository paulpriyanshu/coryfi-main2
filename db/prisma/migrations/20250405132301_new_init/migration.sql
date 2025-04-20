/*
  Warnings:

  - The primary key for the `_OfferCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_OfferProducts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_OfferCategories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_OfferProducts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_OfferCategories" DROP CONSTRAINT "_OfferCategories_AB_pkey";

-- AlterTable
ALTER TABLE "_OfferProducts" DROP CONSTRAINT "_OfferProducts_AB_pkey";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentSessionId" TEXT NOT NULL,
    "cashfreeOrderId" TEXT,
    "transactionStatus" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "paymentInstrument" JSONB,
    "referenceId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "responsePayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "_OfferCategories_AB_unique" ON "_OfferCategories"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_OfferProducts_AB_unique" ON "_OfferProducts"("A", "B");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

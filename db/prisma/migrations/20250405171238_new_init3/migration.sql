/*
  Warnings:

  - Added the required column `customerName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentCurrency` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "bankReference" TEXT,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "paymentAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentCurrency" TEXT NOT NULL,
ADD COLUMN     "paymentMessage" TEXT;

/*
  Warnings:

  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `cashfreeOrderId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentInstrument` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentSessionId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `responsePayload` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionStatus` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `customerEmail` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentDetails` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMode` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentStatus` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTime` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amount",
DROP COLUMN "cashfreeOrderId",
DROP COLUMN "currency",
DROP COLUMN "paymentInstrument",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentSessionId",
DROP COLUMN "referenceId",
DROP COLUMN "responsePayload",
DROP COLUMN "transactionStatus",
DROP COLUMN "updatedAt",
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "paymentDetails" JSONB NOT NULL,
ADD COLUMN     "paymentMode" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" TEXT NOT NULL,
ADD COLUMN     "paymentTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "transactionId" TEXT NOT NULL;

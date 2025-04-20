-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PAID', 'PENDING');

-- CreateTable
CREATE TABLE "Payout" (
    "id" SERIAL NOT NULL,
    "businessPageId" TEXT NOT NULL,
    "payoutAmount" DECIMAL(12,2) NOT NULL,
    "payoutForDate" TIMESTAMP(3) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_businessPageId_fkey" FOREIGN KEY ("businessPageId") REFERENCES "BusinessPageLayout"("pageId") ON DELETE RESTRICT ON UPDATE CASCADE;

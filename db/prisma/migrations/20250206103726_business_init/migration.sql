-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "businessId" INTEGER;

-- CreateTable
CREATE TABLE "Merchant" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerPhoneNumber" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "ownerPermanentResidenceAddress" TEXT,
    "adharNumber" TEXT NOT NULL,
    "adharRegisteredNumber" TEXT,
    "additionalFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" SERIAL NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "businessAddress" TEXT,
    "gstNo" TEXT,
    "businessNumber" TEXT NOT NULL,
    "udhyamCerti" TEXT,
    "din" TEXT,
    "upiId" TEXT,
    "upiPhoneNumber" TEXT,
    "bankAccountNumber" TEXT,
    "ifscCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_userId_key" ON "Merchant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_adharNumber_key" ON "Merchant"("adharNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Business_merchantId_key" ON "Business"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_businessEmail_key" ON "Business"("businessEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Business_gstNo_key" ON "Business"("gstNo");

-- CreateIndex
CREATE UNIQUE INDEX "Business_businessNumber_key" ON "Business"("businessNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Business_upiId_key" ON "Business"("upiId");

-- CreateIndex
CREATE INDEX "Business_gstNo_idx" ON "Business"("gstNo");

-- CreateIndex
CREATE INDEX "Business_businessNumber_idx" ON "Business"("businessNumber");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

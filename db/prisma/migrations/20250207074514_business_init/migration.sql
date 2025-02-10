/*
  Warnings:

  - You are about to drop the column `bankAccountNumber` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `businessAddress` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `businessEmail` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `businessNumber` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `din` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `gstNo` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `ifscCode` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `udhyamCerti` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `upiId` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `upiPhoneNumber` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `adharNumber` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `adharRegisteredNumber` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `ownerEmail` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `ownerName` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `ownerPermanentResidenceAddress` on the `Merchant` table. All the data in the column will be lost.
  - You are about to drop the column `ownerPhoneNumber` on the `Merchant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Business_Id]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Business_Email]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[GSTIN]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Business_Mobile_Number]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Business_UPI_ID]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Merchant_Id]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[AadharNumber]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - The required column `Business_Id` was added to the `Business` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `Business_Name` to the `Business` table without a default value. This is not possible if the table is not empty.
  - The required column `Merchant_Id` was added to the `Merchant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `Name` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_merchantId_fkey";

-- DropIndex
DROP INDEX "Business_businessEmail_key";

-- DropIndex
DROP INDEX "Business_businessNumber_idx";

-- DropIndex
DROP INDEX "Business_businessNumber_key";

-- DropIndex
DROP INDEX "Business_gstNo_idx";

-- DropIndex
DROP INDEX "Business_gstNo_key";

-- DropIndex
DROP INDEX "Business_merchantId_key";

-- DropIndex
DROP INDEX "Business_upiId_key";

-- DropIndex
DROP INDEX "Merchant_adharNumber_key";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "bankAccountNumber",
DROP COLUMN "businessAddress",
DROP COLUMN "businessEmail",
DROP COLUMN "businessName",
DROP COLUMN "businessNumber",
DROP COLUMN "din",
DROP COLUMN "gstNo",
DROP COLUMN "ifscCode",
DROP COLUMN "udhyamCerti",
DROP COLUMN "upiId",
DROP COLUMN "upiPhoneNumber",
ADD COLUMN     "Alternate_Mobile_Number" TEXT,
ADD COLUMN     "Bank_Account_Number" TEXT,
ADD COLUMN     "Business_Address" TEXT,
ADD COLUMN     "Business_Email" TEXT,
ADD COLUMN     "Business_Id" TEXT NOT NULL,
ADD COLUMN     "Business_Mobile_Number" TEXT,
ADD COLUMN     "Business_Name" TEXT NOT NULL,
ADD COLUMN     "Business_UPI_ID" TEXT,
ADD COLUMN     "Entity" TEXT,
ADD COLUMN     "GSTIN" TEXT,
ADD COLUMN     "IFSC_CODE" TEXT,
ADD COLUMN     "Operational_Since" TIMESTAMP(3),
ADD COLUMN     "Sector" TEXT,
ADD COLUMN     "Udyam_Registration_Number" TEXT,
ALTER COLUMN "merchantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "categoryCarouselId" INTEGER;

-- AlterTable
ALTER TABLE "Merchant" DROP COLUMN "adharNumber",
DROP COLUMN "adharRegisteredNumber",
DROP COLUMN "ownerEmail",
DROP COLUMN "ownerName",
DROP COLUMN "ownerPermanentResidenceAddress",
DROP COLUMN "ownerPhoneNumber",
ADD COLUMN     "AadharNumber" TEXT,
ADD COLUMN     "AlternativeMobileNumber" TEXT,
ADD COLUMN     "Email" TEXT,
ADD COLUMN     "Merchant_Id" TEXT NOT NULL,
ADD COLUMN     "MobileNumber" TEXT,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "PAN" TEXT,
ADD COLUMN     "PermanentAdress" TEXT,
ADD COLUMN     "UPI_ID" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryCarouselId" INTEGER;

-- CreateTable
CREATE TABLE "BusinessPageLayout" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bannerImageUrls" TEXT[],
    "dpImageUrl" TEXT,

    CONSTRAINT "BusinessPageLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryCarousel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "businessId" INTEGER NOT NULL,

    CONSTRAINT "CategoryCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_Business_Id_key" ON "Business"("Business_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Business_Business_Email_key" ON "Business"("Business_Email");

-- CreateIndex
CREATE UNIQUE INDEX "Business_GSTIN_key" ON "Business"("GSTIN");

-- CreateIndex
CREATE UNIQUE INDEX "Business_Business_Mobile_Number_key" ON "Business"("Business_Mobile_Number");

-- CreateIndex
CREATE UNIQUE INDEX "Business_Business_UPI_ID_key" ON "Business"("Business_UPI_ID");

-- CreateIndex
CREATE INDEX "Business_merchantId_idx" ON "Business"("merchantId");

-- CreateIndex
CREATE INDEX "Business_id_idx" ON "Business"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_Merchant_Id_key" ON "Merchant"("Merchant_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_AadharNumber_key" ON "Merchant"("AadharNumber");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("Merchant_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_categoryCarouselId_fkey" FOREIGN KEY ("categoryCarouselId") REFERENCES "CategoryCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryCarouselId_fkey" FOREIGN KEY ("categoryCarouselId") REFERENCES "CategoryCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryCarousel" ADD CONSTRAINT "CategoryCarousel_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessPageLayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

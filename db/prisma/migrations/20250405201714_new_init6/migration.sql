/*
  Warnings:

  - You are about to drop the column `addressLine1` on the `UserDetails` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `UserDetails` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `UserDetails` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `UserDetails` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `UserDetails` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `UserDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserDetails" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "state",
DROP COLUMN "zip";

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "landmark" TEXT,
    "instructions" TEXT,
    "userDetailsId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_userDetailsId_type_key" ON "Address"("userDetailsId", "type");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userDetailsId_fkey" FOREIGN KEY ("userDetailsId") REFERENCES "UserDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

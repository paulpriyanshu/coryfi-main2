/*
  Warnings:

  - The `productIds` column on the `Cart` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productIds` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `Cart` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "productIds",
ADD COLUMN     "productIds" INTEGER[];

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "productIds",
ADD COLUMN     "productIds" INTEGER[];

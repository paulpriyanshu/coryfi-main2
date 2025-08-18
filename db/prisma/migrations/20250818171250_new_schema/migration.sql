-- DropForeignKey
ALTER TABLE "Counter" DROP CONSTRAINT "Counter_productId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_productId_fkey";

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

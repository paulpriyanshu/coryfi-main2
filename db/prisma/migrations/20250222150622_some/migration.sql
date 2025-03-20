-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "variantProductId" INTEGER;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_variantProductId_fkey" FOREIGN KEY ("variantProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

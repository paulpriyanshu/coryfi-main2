-- AlterTable
ALTER TABLE "_OfferCategories" ADD CONSTRAINT "_OfferCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OfferCategories_AB_unique";

-- AlterTable
ALTER TABLE "_OfferProducts" ADD CONSTRAINT "_OfferProducts_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OfferProducts_AB_unique";

-- CreateTable
CREATE TABLE "Counter" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "keyValues" JSONB,
    "type" TEXT,
    "description" TEXT,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

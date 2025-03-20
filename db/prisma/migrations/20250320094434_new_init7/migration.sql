-- CreateTable
CREATE TABLE "Fields" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Fields_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Fields" ADD CONSTRAINT "Fields_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

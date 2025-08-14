-- DropForeignKey
ALTER TABLE "InterestSubcategory" DROP CONSTRAINT "InterestSubcategory_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "InterestSubcategory" ADD CONSTRAINT "InterestSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InterestCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

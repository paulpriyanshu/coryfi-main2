-- DropForeignKey
ALTER TABLE "Segment" DROP CONSTRAINT "Segment_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserSubcategory" DROP CONSTRAINT "UserSubcategory_subcategoryId_fkey";

-- AddForeignKey
ALTER TABLE "UserSubcategory" ADD CONSTRAINT "UserSubcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "InterestSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "InterestSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

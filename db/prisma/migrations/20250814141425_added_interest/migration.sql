-- CreateTable
CREATE TABLE "UserSubcategory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subcategoryId" INTEGER NOT NULL,

    CONSTRAINT "UserSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InterestCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestSubcategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "InterestSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subcategoryId" INTEGER NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubcategory_userId_subcategoryId_key" ON "UserSubcategory"("userId", "subcategoryId");

-- AddForeignKey
ALTER TABLE "UserSubcategory" ADD CONSTRAINT "UserSubcategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubcategory" ADD CONSTRAINT "UserSubcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "InterestSubcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterestSubcategory" ADD CONSTRAINT "InterestSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InterestCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "InterestSubcategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

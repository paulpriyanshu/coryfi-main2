/*
  Warnings:

  - A unique constraint covering the columns `[businessPageId]` on the table `CategoryCarousel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoryCarousel_businessPageId_key" ON "CategoryCarousel"("businessPageId");

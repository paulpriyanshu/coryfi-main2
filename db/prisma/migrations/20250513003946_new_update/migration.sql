-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "postId" INTEGER;

-- CreateIndex
CREATE INDEX "Notification_postId_idx" ON "Notification"("postId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

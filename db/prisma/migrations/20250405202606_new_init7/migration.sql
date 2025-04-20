-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "addressLine1" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "zip" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

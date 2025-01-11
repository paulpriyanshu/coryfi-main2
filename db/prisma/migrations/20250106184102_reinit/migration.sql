-- CreateTable
CREATE TABLE "EvaluationApprovals" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "evaluationIds" INTEGER[],
    "evaluationWorked" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationApprovals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationApprovals_requesterId_recipientId_key" ON "EvaluationApprovals"("requesterId", "recipientId");

-- AddForeignKey
ALTER TABLE "EvaluationApprovals" ADD CONSTRAINT "EvaluationApprovals_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationApprovals" ADD CONSTRAINT "EvaluationApprovals_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

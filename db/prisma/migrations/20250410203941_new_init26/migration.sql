/*
  Warnings:

  - A unique constraint covering the columns `[task_id]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `task_id` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "task_id" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_task_id_key" ON "Task"("task_id");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

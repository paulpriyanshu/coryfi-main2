/*
  Warnings:

  - A unique constraint covering the columns `[task_id,employeeId,status]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Task_task_id_employeeId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Task_task_id_employeeId_status_key" ON "Task"("task_id", "employeeId", "status");

/*
  Warnings:

  - A unique constraint covering the columns `[task_id,employeeId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Task_task_id_employeeId_key" ON "Task"("task_id", "employeeId");

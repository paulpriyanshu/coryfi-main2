"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Trash2 } from "lucide-react"
import { useState } from "react"

export default function EmployeeDetailsDialog({ open, onOpenChange, employee, onMarkTaskCompleted, onDeleteTask }) {
  const [deletingTaskId, setDeletingTaskId] = useState(null)

  if (!employee) return null

  const handleDeleteTask = async (taskId) => {
    try {
      setDeletingTaskId(taskId)
      await onDeleteTask(taskId, employee.id)
      window.location.reload()
    } catch (error) {
      console.error("Error deleting task:", error)
    } finally {
      setDeletingTaskId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>View detailed information about this employee</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>{employee.user?.name || "N/A"}</CardTitle>
              <CardDescription>Employee ID: {employee.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Business</h4>
                  <p className="text-sm text-muted-foreground">{employee.business?.name || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Job Title</h4>
                  <p className="text-sm text-muted-foreground">{employee.job?.title || "N/A"}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Tasks</h4>
                {employee.tasks && employee.tasks.length > 0 ? (
                  <ul className="space-y-2">
                    {employee.tasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{task.name}</span>
                          {task.status === "completed" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status !== "completed" && (
                            <Button variant="ghost" size="sm" onClick={() => onMarkTaskCompleted(task.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.task_id)}
                            disabled={deletingTaskId === task.id}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tasks assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

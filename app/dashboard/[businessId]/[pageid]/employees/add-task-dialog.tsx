"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddTaskDialog({ open, onOpenChange, employee, onSubmit }) {
  const [taskName, setTaskName] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(taskName)
    setTaskName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task for {employee?.user?.name || "Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskName" className="text-right">
                Task Name
              </Label>
              <Input
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

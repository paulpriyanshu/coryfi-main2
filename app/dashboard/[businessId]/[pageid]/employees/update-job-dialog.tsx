"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UpdateJobDialog({ open, onOpenChange, employee, onSubmit }) {
  const [jobId, setJobId] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(Number.parseInt(jobId))
    setJobId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Job for {employee?.user?.name || "Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jobId" className="text-right">
                New Job ID
              </Label>
              <Input
                id="jobId"
                type="number"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Update Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

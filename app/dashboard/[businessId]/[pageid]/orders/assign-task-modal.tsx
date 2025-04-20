"use client"

import { useState, useEffect } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  id: number
  name: string
  user: {
    name: string
  }
  job: {
    title: string
  }
}



export function AssignTaskModal({
  isOpen,
  onClose,
  businessId,
  companyId,
  orderId,
  getEmployeesByBusiness,
  assignTaskToEmployee,
}) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [taskName, setTaskName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && businessId) {
      fetchEmployees()
    }
  }, [isOpen, businessId])

  const fetchEmployees = async () => {
    if (!businessId) return

    setIsFetchingEmployees(true)
    try {
      const employeesList = await getEmployeesByBusiness(businessId)
      setEmployees(employeesList)
    } catch (error) {
      toast({
        title: "Error fetching employees",
        description: "Could not load employees. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingEmployees(false)
    }
  }

  const handleAssignTask = async () => {
      console.log("adding task ")
    if (!selectedEmployee) {
      toast({
        title: "No employee selected",
        description: "Please select an employee to assign the task.",
        variant: "destructive",
      })
      return
    }

    if (!taskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a name for the task.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await assignTaskToEmployee({
        employeeId: selectedEmployee.id,
        businessId,
        companyId,
        orderId,
        taskName,
      })

      if (result.success) {
        toast({
          title: "Task assigned",
          description: `Task "${taskName}" has been assigned to ${selectedEmployee.user.name}.`,
        })
        handleClose()
      } else {
        toast({
          title: "Failed to assign task",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedEmployee(null)
    setTaskName("")
    onClose()
  }

  const handleEmployeeClick = (employee: Employee) => {
    console.log("selected employee")
    setSelectedEmployee(employee)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Task to Employee</DialogTitle>
          <DialogDescription>Select an employee and enter a task name to assign work for this order.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            {isFetchingEmployees ? (
              <div className="flex items-center p-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading employees...
              </div>
            ) : (
              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                {employees.length === 0 ? (
                  <div className="p-3 text-sm text-center text-muted-foreground">
                    No employees found
                  </div>
                ) : (
                  <div className="space-y-1 p-1">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm rounded-md cursor-pointer",
                          selectedEmployee?.id === employee.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        <div className="flex items-center w-full">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedEmployee?.id === employee.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{employee.user.name}</span>
                            <span className={cn(
                              "text-xs",
                              selectedEmployee?.id === employee.id 
                                ? "text-primary-foreground/80" 
                                : "text-muted-foreground"
                            )}>
                              {employee.job?.title || "No job title"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Deliver order to customer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAssignTask} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

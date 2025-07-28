"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/Input"
import {
  deleteEmployee,
  updateEmployeeJob,
  addTaskToEmployee,
  markTaskCompleted,
  addEmployeeByEmail,
  searchEmployeesByName,
  getEmployeesByBusiness,
  deleteTaskAssignment,
} from "@/app/api/actions/employees"
import CreateEmployeeDialog from "./create-employee-dialog"
import UpdateJobDialog from "./update-job-dialog"
import AddTaskDialog from "./add-task-dialog"
import EmployeeDetailsDialog from "./employee-details-dialog"

export default function EmployeesList({ initialEmployees, pageId }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUpdateJobDialogOpen, setIsUpdateJobDialogOpen] = useState(false)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const businessId = pageId // Use the pageId as businessId

  const handleCreateEmployee = async (data) => {
    try {
      console.log("creating emplooyee")
      // Add businessId from pageId
      const result = await addEmployeeByEmail({
        ...data,
        businessId,
      })

      if (result.success) {
        setEmployees([...employees, result.data])
      }

      return result
    } catch (error) {
      console.error("Failed to create employee:", error)
      return { success: false, message: error.message || "Failed to create employee" }
    }
  }

  const handleUpdateJob = async (newJobId) => {
    try {
      await updateEmployeeJob(selectedEmployee.id, newJobId)
      const updatedEmployees = employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, jobId: newJobId } : emp,
      )
      setEmployees(updatedEmployees)
      setIsUpdateJobDialogOpen(false)
    } catch (error) {
      console.error("Failed to update job:", error)
    }
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(employeeId)
        setEmployees(employees.filter((emp) => emp.id !== employeeId))
      } catch (error) {
        console.error("Failed to delete employee:", error)
      }
    }
  }

  const handleAddTask = async (taskName) => {
    try {
      const newTask = await addTaskToEmployee(selectedEmployee.id, taskName)
      const updatedEmployees = employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, tasks: [...emp.tasks, newTask] } : emp,
      )
      setEmployees(updatedEmployees)
      setIsAddTaskDialogOpen(false)
    } catch (error) {
      console.error("Failed to add task:", error)
    }

  }

  const handleDeleteTask = async (taskId, employeeId) => {
    try {
      // Call the deleteTaskAssignment function
      await deleteTaskAssignment(taskId, employeeId)

      // Update the local state to reflect the deletion
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) => {
          if (emp.id === employeeId) {
            return {
              ...emp,
              tasks: emp.tasks.filter((task) => task.id !== taskId),
            }
          }
          return emp
        }),
      )

      // Also update the selected employee if it's the current one
      if (selectedEmployee && selectedEmployee.id === employeeId) {
        setSelectedEmployee({
          ...selectedEmployee,
          tasks: selectedEmployee.tasks.filter((task) => task.id !== taskId),
        })
      }
    } catch (error) {
      console.error("Error deleting task assignment:", error)
      // Handle error (show toast notification, etc.)
    }
  }
  const handleMarkTaskCompleted = async (taskId) => {
    try {
      await markTaskCompleted(taskId)
      const updatedEmployees = employees.map((emp) => {
        if (emp.tasks.some((task) => task.id === taskId)) {
          return {
            ...emp,
            tasks: emp.tasks.map((task) => (task.id === taskId ? { ...task, status: "completed" } : task)),
          }
        }
        return emp
      })
      setEmployees(updatedEmployees)
    } catch (error) {
      console.error("Failed to mark task as completed:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) return

    setIsSearching(true)
    try {
      const results = await searchEmployeesByName({
        businessId, // Use the pageId as businessId
        nameQuery: searchQuery,
      })
      setEmployees(results)
    } catch (error) {
      console.error("Failed to search employees:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const resetSearch = async () => {
    setSearchQuery("")
    try {
      // Refresh the employees list for the current business
      const refreshedEmployees = await getEmployeesByBusiness(businessId)
      // console.log("refreshed emplyees",refreshedEmployees)
      setEmployees(refreshedEmployees)
    } catch (error) {
      console.error("Failed to reset search:", error)
      setEmployees(initialEmployees)
    }
  }

  return (
    <div className="dark:bg-black ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Employees</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? "Searching..." : "Search"}
        </Button>
        {searchQuery && (
          <Button variant="ghost" onClick={resetSearch}>
            Reset
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No employees found. Add your first employee to get started.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.user?.name || "N/A"}</TableCell>
                  <TableCell>{employee.job?.title || "N/A"}</TableCell>
                  <TableCell>{employee.tasks?.length || 0} tasks</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsDetailsDialogOpen(true)
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsUpdateJobDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsAddTaskDialogOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteEmployee(employee.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateEmployeeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateEmployee}
        businessId={businessId}
      />

      {selectedEmployee && (
        <>
          <UpdateJobDialog
            open={isUpdateJobDialogOpen}
            onOpenChange={setIsUpdateJobDialogOpen}
            employee={selectedEmployee}
            onSubmit={handleUpdateJob}
          />

          <AddTaskDialog
            open={isAddTaskDialogOpen}
            onOpenChange={setIsAddTaskDialogOpen}
            employee={selectedEmployee}
            onSubmit={handleAddTask}
          />

          <EmployeeDetailsDialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            employee={selectedEmployee}
            onMarkTaskCompleted={handleMarkTaskCompleted}
            onDeleteTask={handleDeleteTask}
          />
        </>
      )}
    </div>
  )
}

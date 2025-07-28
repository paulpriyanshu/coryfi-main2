"use client"

import React, { useState } from "react"
import { TableCell } from "@/components/ui/table"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { toast } from "react-hot-toast"

const EmployeeTaskDropdownCell = ({ item, order, allEmployees, onChangeAssignment }) => {
  const [open, setOpen] = useState(false)
  console.log("employee order",order,order?.tasks?.length)

  const assigned = order?.tasks?.[order?.tasks?.length-1]?.employee
  const assignedName = assigned?.user?.name || "not assigned"

  const isDisabled = item.productFulfillmentStatus === "fulfilled" 

  const handleSelect = async(employee) => {
    if (isDisabled || assigned?.id === employee.id) return

    const confirmed = confirm(`Change assignment to ${employee.name}?`)
    if (confirmed) {
      await onChangeAssignment(order.order_id, employee.id)
      toast.success(`Assigned to ${employee.name}`)
      setOpen(false)
    }
  }

  return (
    <TableCell>
      {item.recieveBy?.type === "DELIVERY" ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="text-xs px-2 h-6"
              disabled={isDisabled}
            >
              {assignedName} <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              {allEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleSelect(employee)}
                  className={`flex items-center justify-between p-1 rounded text-sm ${
                    isDisabled
                      ? "text-muted-foreground cursor-not-allowed"
                      : "hover:bg-muted cursor-pointer"
                  }`}
                >
                  <span>{employee.name}</span>
                  {assigned?.id === employee.id && <Check className="h-4 w-4 text-green-500" />}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="text-muted-foreground text-xs">not assigned</div>
      )}
    </TableCell>
  )
}

export default EmployeeTaskDropdownCell
import { getAllEmployees, getAllEmployeesByBusiness } from "@/app/api/actions/employees"
import EmployeesList from "./employees-list"

export default async function EmployeesPage({params}) {
    const businessId=params.businessId
    const pageId=params.pageid

  const employees = await getAllEmployeesByBusiness(pageId)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Employees Management</h1>
      <EmployeesList initialEmployees={employees}  pageId={pageId}/>
    </div>
  )
}

import OrdersDashboard from './order-dashboard'
import { getAllEmployeesByBusiness } from '@/app/api/actions/employees'

interface OrdersPageProps {
  params: {
    businessId: string
    pageid: string
  }
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { businessId, pageid } = params
  const allEmployees=await getAllEmployeesByBusiness(pageid)
  // console.log("all employees",allEmployees)

  const transformedEmployees = allEmployees.map(emp => ({
  id: emp.id,
  name: emp.user.name,
  dp: emp.user.userdp,
  email: emp.user.email,
}))
// console.log("transformed employees",transformedEmployees)
  return (
    <>
    <div className='dark:bg-black w-full'>
        <OrdersDashboard
      // ordersData={ordersData}
      employees={transformedEmployees}
      pageId={pageid}
      businessId={businessId}
    />

    </div>
    
  
    </>
  )
}
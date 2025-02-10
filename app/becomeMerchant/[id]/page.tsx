
import { createMerchant } from '@/app/api/business/business'
import MerchantForm from './MerchantForm'
import { Toaster } from '@/components/ui/toaster'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function CreateMerchantPage({params}) {
    const userId=params.id
    const session=await getServerSession(authOptions)
    if(!session){
      redirect("/signup")
    }

  return (
    <div className="container mx-auto py-10">
      <div className="text-3xl font-bold mb-6 flex justify-center w-full">Create a Business Page</div>
      <MerchantForm userId={userId} email={session?.user?.email} createMerchant={createMerchant}/>
      <Toaster />
    </div>
  )
}

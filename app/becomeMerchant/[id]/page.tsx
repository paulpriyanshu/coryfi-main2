// import { createMerchant } from '@/app/api/business/business'
import MerchantForm from './MerchantForm'
import { Toaster } from '@/components/ui/toaster'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function CreateMerchantPage({ params }) {
  const userId = params.id
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signup")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a Business Page</h1>
      
      {/* Ensuring MerchantForm is centered */}
      <div className="w-full max-w-2xl">
        <MerchantForm userId={userId} email={session?.user?.email}  />
      </div>

      <Toaster />
    </div>
  )
}
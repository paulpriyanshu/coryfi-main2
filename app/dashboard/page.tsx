import { EditableBusinessProfile } from '@/components/editable-business-profile'
import React from 'react'
import { fetchUserId } from '../api/actions/media'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { verifyMerchant } from '../api/business/business'


// Server-side logic for fetching user data and verifying merchant status
export default async function Page() {
  // Fetch the session to get the current user
  const session = await getServerSession(authOptions)
  


  // Fetch the user ID based on email
  const userData = await fetchUserId(session.user.email)

  console.log("this is userdata",userData)
  const isMerchant = await verifyMerchant(userData.id)
  console.log("isMerchant", isMerchant)

  // Redirect if the user is not a merchant
 

  // Render the EditableBusinessProfile if the user is a merchant
  return (
    <div>
      <EditableBusinessProfile  isMerchant={isMerchant} userId={userData.id}/>
    </div>
  )
}
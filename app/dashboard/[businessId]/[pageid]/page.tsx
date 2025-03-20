import BusinessProfile from '@/components/editable-business-profile'
import React from 'react'
import { fetchUserId } from '../../../api/actions/media'
import { getBusinessPage } from '../../../api/business/business'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import { verifyMerchant } from '../../../api/business/business'

interface PageProps {
  params: {
    slug: string[] // [businessId, pageId]
  }
}

export default async function Page({ params }) {
  const slug=params
  console.log("params",slug)
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return <div>Unauthorized</div>
  }

  // Extract businessId and pageId from params
  const slugArray = params.slug || [];
  console.log("Slug Array:", slugArray);
  
  const businessId = slug.businessId
  const pageId = slug.pageid
  
  console.log("Business ID:", businessId);
  console.log("Page ID:", pageId);
  
  if (!businessId || !pageId) {
    return <div>Invalid Request</div>;
  }

  // Fetch user ID based on email
  const userData = await fetchUserId(session.user.email)
  console.log("user id",userData)
  if (!userData) {
    return <div>Invalid User</div>
  }
  const isMerchant = await verifyMerchant(userData.id)
  if (!isMerchant) {
    return <div>Not Authorized</div>
  }

  // Verify if the business belongs to the logged-in user
  console.log("Merchant",JSON.stringify(isMerchant,null,2))
  const hasBusiness = isMerchant.data.businesses?.some(
    business => business.Business_Id === businessId
  );
  console.log("hasBusiness",hasBusiness)
  
  const hasPage = isMerchant.data.businesses?.some(
    business =>
      business.Business_Id === businessId &&
      business.businessPageLayout?.some(page => page.pageId === pageId)
  );
  console.log("hasPage",hasPage)
  
  if (!hasBusiness || !hasPage) {
    console.log("Access Denied because:");
    if (!hasBusiness) console.log("- Business_Id does not match");
    if (!hasPage) console.log("- PageId does not match within the correct business");
  
    return <div>Access Denied</div>;
  }

  
//   if (isMerchant.data.businesses?.some(business => 
//     business?.Business_Id !== businessId ||
//     business?.businessPageLayout?.some(page => page?.pageId !== pageId)
// )) {
//     return <div>Access Denied</div>
//   }
 
  // Verify if the user is a merchant
 

  return (
    <div>
      <BusinessProfile isMerchant={isMerchant} userId={userData.id} businessId={businessId} pageId={pageId}/>
    </div>
  )
}
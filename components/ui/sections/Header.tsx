import Link from "next/link"
import Image from "next/image"
import { Home, Compass, Network, Search, Store } from 'lucide-react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { fetchUserId } from "@/app/api/actions/media"
import { getBusiness, getBusinessPage, verifyMerchant } from "@/app/api/business/business"
import { NavbarClient } from "./navbar-client"
import CartButton from "./cart-button"
import Notifications from "./Notifications"
// import { SelectDemo } from "./SelectPage"

export default async function Header() {
  const session = await getServerSession(authOptions)
  const pathname = ""; // This will be handled client-side
  
  // Server-side data fetching
  let userId = null;
  let userDp = "";
  let isMerchant = false;
  let businessId = "";
  let pageId = "";
  
  if (session?.user?.email) {
    try {
      const user = await fetchUserId(session.user.email);
      if (user) {
        userId = user.id;
        userDp = user.userdp;
        
        // Verify merchant status
        const verify = await verifyMerchant(user.id);
        
        if (verify && verify.data && verify.data.Merchant_Id) {
          const business_data = await getBusiness(verify.data.Merchant_Id);
          
          if (business_data && business_data.business && business_data.business.Business_Id) {
            isMerchant = true;
            businessId = business_data.business.Business_Id;
            
            const business_pageData = await getBusinessPage(businessId);
            if (business_pageData?.pageData?.pageId) {
              pageId = business_pageData.pageData.pageId;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }
  
  const navItems = [
    { icon: <Home className="h-5 w-5" />, href: "/feed", tooltip: "Home" },
    { icon: <Network className="h-5 w-5" />, href: "/", tooltip: "Network" },
    { icon: <Store className="h-5 w-5" />, href: "/explore", tooltip: "Businesses" },
  ]
  
  // Determine dashboard link based on merchant status
  const dashboardLink = isMerchant && businessId && pageId 
    ? `/dashboard/${businessId}/${pageId}` 
    : userId ? `/becomeMerchant/${userId}` : "/";

  return (
    <NavbarClient
      session={session}
      userId={userId}
      userDp={userDp}
      navItems={navItems}
      dashboardLink={dashboardLink}
      businessId={businessId}
    >
      <div className="flex items-center">
        <Link href="/" className="flex items-center justify-start md:ml-10">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={120}
            height={40}
            className="w-auto h-8 md:h-10"
          />
        </Link>
      </div>
      
      {userId && <CartButton userId={userId} />}
      <Notifications />
    </NavbarClient>
  )
}

import SidebarClient from "./sidebarclient"
import { getMerchant } from "@/app/api/business/business"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function ModernSidebar({ pageId }: { pageId: string }) {
  const session = await getServerSession(authOptions)
  const businessData = await getMerchant(session?.user?.email)
  const businessId = businessData?.businesses?.[0]?.Business_Id || ""

  console.log("this is business id", businessId)

  const menuItems = [
    { name: "Home", icon: "Home", href: `/dashboard/${businessId}/${pageId}`},
    {
      name: "Products",
      icon: "ShoppingBag",
      href: `/dashboard/${businessId}/products`,
      subItems: [
        { name: "All Products", href: `/dashboard/${businessId}/${pageId}/products` },
        { name: "Categories", href: `/dashboard/${businessId}/${pageId}/categories` },
        { name: "Discounts", href: `/dashboard/${businessId}/${pageId}/discounts` },
        { name: "Fields", href: `/dashboard/${businessId}/${pageId}/fields` },
      ],
    },
    { name: "Customers", icon: "Users", href: `/dashboard/${businessId}/${pageId}/customers` },
    { name: "Analytics", icon: "BarChart2", href: `/dashboard/${businessId}/${pageId}/analytics` },
    { name: "Sales", icon: "DollarSign", href: `/dashboard/${businessId}/${pageId}/sales` },
    { name: "Settings", icon: "Settings", href: `/dashboard/${businessId}/${pageId}/settings` },
  ]

  return <SidebarClient menuItems={menuItems} />
}
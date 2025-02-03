"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown, Home, ShoppingBag, Users, BarChart2, DollarSign, Settings, ChevronRight } from 'lucide-react'

const menuItems = [
  { name: "Home", icon: Home, href: "/dashboard" },
  {
    name: "Products",
    icon: ShoppingBag,
    href: "/dashboard/products",
    subItems: [
      { name: "All Products", href: "/dashboard/products" },
      { name: "Categories", href: "/dashboard/categories" },
      { name: "Variants", href: "/dashboard/variants" },
      { name: "Discounts", href: "/dashboard/discounts" },
    ],
  },
  {
    name: "Customers",
    icon: Users,
    href: "/dashboard/customers",
    subItems: [
      { name: "All Customers", href: "/dashboard/customers" },
      { name: "Segments", href: "/dashboard/customers/segments" },
    ],
  },
  { name: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
  { name: "Sales", icon: DollarSign, href: "/dashboard/sales" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export default function ModernSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(true)

  // Handle hover events to expand the sidebar
  const handleMouseEnter = () => setIsCollapsed(false)
  const handleMouseLeave = () => setIsCollapsed(true)

  return (
    <div
      className="relative flex h-screen"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-gray-200 flex flex-col min-h-screen`}
      >
        <div className={`flex-1 ${isCollapsed ? "px-2 py-4" : "p-6"}`}>
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  {item.subItems && !isCollapsed ? (
                    <DropdownMenuItem item={item} pathname={pathname} />
                  ) : (
                    <Link href={item.href} className="block" >
                      <button
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all w-full ${
                          pathname === item.href ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50"
                        } ${isCollapsed ? "justify-center px-2" : ""}`}
                        title={isCollapsed ? item.name : ""}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium flex justify-center">{item.name}</span>
                            {item.subItems && (
                              <ChevronDown className="h-4 w-4 flex-shrink-0" />
                            )}
                          </>
                        )}
                      </button>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-50"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </motion.div>
      </button>
    </div>
  )
}

function DropdownMenuItem({ item, pathname }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isActive = item.subItems?.some((subItem) => subItem.href === pathname)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
          isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{item.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </motion.div>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <ul className="ml-6 mt-2 space-y-1">
          {item.subItems.map((subItem) => (
            <li key={subItem.name}>
              <Link href={subItem.href} className="block">
                <button
                  className={`block w-full text-left p-2 rounded-md transition-all ${
                    pathname === subItem.href ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {subItem.name}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
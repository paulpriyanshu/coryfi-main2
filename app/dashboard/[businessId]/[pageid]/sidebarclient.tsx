"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown, ChevronRight, Home, ShoppingBag, Users, BarChart2, DollarSign, Settings } from "lucide-react"

const iconMap = {
  Home,
  ShoppingBag,
  Users,
  BarChart2,
  DollarSign,
  Settings,
}

export default function SidebarClient({ menuItems }: { menuItems: any[] }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(true)

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
          isCollapsed ? "w-10 md:w-16" : "w-screen md:w-64"
        } bg-white border-r border-gray-200 flex flex-col min-h-screen`}
      >
        <div className={`flex-1 ${isCollapsed ? "px-2 py-4" : "p-6"}`}>
          <nav>
            <ul className="space-y-2">
              {menuItems?.map((item) => {
                const IconComponent = iconMap[item.icon] ?? null

                return (
                  <li key={item.name}>
                    {item.subItems && !isCollapsed ? (
                      <DropdownMenuItem item={item} pathname={pathname} />
                    ) : (
                      <Link href={item.href} className="block">
                        <button
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all w-full ${
                            pathname === item.href
                              ? "bg-blue-50 text-blue-600 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50"
                          } ${isCollapsed ? "justify-center px-2" : ""}`}
                          title={isCollapsed ? item.name : ""}
                        >
                          {IconComponent && <IconComponent className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />}
                          {!isCollapsed && (
                            <>
                              <span className="font-medium flex justify-center">{item.name}</span>
                              {item.subItems && <ChevronDown className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />}
                            </>
                          )}
                        </button>
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-50"
      >
        <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </motion.div>
      </button>
    </div>
  )
}

function DropdownMenuItem({ item, pathname }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isActive = item.subItems?.some((subItem) => subItem.href === pathname)
  const IconComponent = iconMap[item.icon] ?? null // Fixed icon issue

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
          isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3">
          {IconComponent && <IconComponent className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />}
          <span className="font-medium">{item.name}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
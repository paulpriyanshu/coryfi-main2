"use client"

import React, { useState } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft,ListTodo, ChevronRight, User, Route, LogOut, Settings } from 'lucide-react'

interface SidebarItem {
  icon: React.ElementType
  label: string
  href: string
}

const sidebarItems: SidebarItem[] = [
  { icon: User, label: 'Profile', href: '/settings/profile' },
  { icon: Route, label: 'Paths', href: '/settings/userPaths' },
  { icon: ListTodo, label: 'Tasks', href: '/settings/tasks' }
]

interface CustomSidebarProps {
  className?: string
}

export function CustomSidebar({ className }: CustomSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className={cn(
      "flex flex-col h-screen sticky top-0 ",
      className
    )}>
              <div className={cn(
                "flex flex-col h-full bg-background transition-all duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-64"
                          )}>
                            {/* Header */}
                            <div className="p-4 border-b">
                              <div className="flex items-center justify-between">
                              {!isCollapsed && (
                      <div className="flex flex-row items-center ml-3 w-full">
                        <Settings className="text-lg font-semibold mr-2" />
                        <span>Settings</span>
                      </div>
                    )}
                    <Button
              variant="ghost"
              size="icon"
              className={cn("", isCollapsed ? "mx-auto" : "ml-auto")}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-2" : "px-4"
                )}
                asChild
              >
                <a href={item.href}>
                  <item.icon className={cn(
                    "h-5 w-5",
                    isCollapsed ? "mx-auto" : "mr-2"
                  )} />
                  {!isCollapsed && <span>{item.label}</span>}
                </a>
              </Button>
            ))}
          </nav>
        </ScrollArea>


      </div>
    </div>
  )
}

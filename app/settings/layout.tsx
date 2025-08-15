"use client"

import { CustomSidebar } from "./CustomSidebar"
import React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-black">
      {/* Sidebar */}
      
      <CustomSidebar className="hidden md:block" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>
    </div>
  )
}

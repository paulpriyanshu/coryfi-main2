// app/dashboard/layout.tsx
import React from "react";
import ModernSidebar from "./sidebar"; // Ensure correct import path

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
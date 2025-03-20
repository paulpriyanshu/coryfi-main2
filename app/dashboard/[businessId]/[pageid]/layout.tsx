
import React from "react";
import ModernSidebar from "./sidebar"; //
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children , params }: { children: React.ReactNode ; params: { pageid : string} }) {

  

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar pageId={params.pageid}/>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            },
            success: {
              iconTheme: {
                primary: "hsl(var(--success))",
                secondary: "hsl(var(--success-foreground))",
              },
            },
            error: {
              iconTheme: {
                primary: "hsl(var(--destructive))",
                secondary: "hsl(var(--destructive-foreground))",
              },
            },
          }}
        />
      </main>
    </div>
  );
}
"use client"
import CoryfiMobile from '@/components/ui/CoryfiMobile';
import { useState, useEffect } from 'react';

function Page() {
  // Add loading state to prevent hydration mismatch
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile to match SSR
  
  useEffect(() => {
    // Move all window checks inside useEffect
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLoading(false); // Mark as loaded after initial check
    };
    
    // Initial check
    checkDevice();
    
    // Handle resize
    window.addEventListener('resize', checkDevice);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const Desktop = () => (
    <div className="min-h-screen bg-white">
      <header className="p-6 bg-gray-100">
        <h1 className="text-3xl font-bold">Desktop Version</h1>
      </header>
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl mb-4">Welcome to Desktop View</h2>
          <p className="text-gray-600">
            This is your desktop layout. Add your desktop-specific components here.
          </p>
        </div>
      </main>
    </div>
  );

  // Remove conditional return for SSR
  // Instead, show nothing while loading
  if (isLoading) {
    return null;
  }

  // Render actual content only after client-side check
  return isMobile ? <CoryfiMobile /> : <Desktop />;
}

export default Page;
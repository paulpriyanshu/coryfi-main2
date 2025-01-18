'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sections/mainsidebar';
import PersonalNetwork from './PersonalNetwork';
import { useIsMobile } from '@/hooks/use-mobile';
import { SignInDialog } from './SigninDialog';
import { useAppSelector } from '@/app/libs/store/hooks';
import { selectResponseData } from '@/app/libs/features/pathdata/pathSlice';

interface MainContentProps {
  initialTab: string;
  shouldExpand: boolean;
  collabCount: number;
  userData: any;
  sessionEmail: string | null;
}

export function MainContent({
  initialTab,
  shouldExpand,
  collabCount,
  userData,
  sessionEmail
}: MainContentProps) {
  const [isExpanded, setIsExpanded] = useState(shouldExpand);
  const [activeFilter, setActiveFilter] = useState(initialTab);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    const searchParams = new URLSearchParams();
    searchParams.set('tab', activeFilter);
    searchParams.set('expand', String(newExpandState));
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  const handleTabChange = (value: string) => {
    if (!sessionEmail) {
      setIsSignInDialogOpen(true);
      return;
    }
    setActiveFilter(value);
    setIsExpanded(true);
    const searchParams = new URLSearchParams();
    searchParams.set('tab', value);
    searchParams.set('expand', 'true');
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  const data = useAppSelector(selectResponseData);
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  };
  return (
    <div className="h-screen w-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <PersonalNetwork  data={structuredData}/>
      </div>

      <Sidebar
        isExpanded={isExpanded}
        activeFilter={activeFilter}
        onTabChange={handleTabChange}
        onToggle={toggleSidebar}
        collabCount={collabCount}
        isMobile={isMobile}
        userData={userData}
      />

      <SignInDialog
        isOpen={isSignInDialogOpen}
        onClose={() => setIsSignInDialogOpen(false)}
      />
    </div>
  );
}
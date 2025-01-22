'use client';

import { useEffect, useState } from 'react';
import PersonalNetwork from '@/components/ui/sections/PersonalNetwork';
import Sidetabs from './Sidetabs';

type FilterType = 'results' | 'collab' | 'recents' | 'chats';



export default function ClientComponent({
  initialPathData,
  initialTab,
  initialExpanded,
  userEmail
}) {

  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  
 



  return (
    <div className="h-screen w-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <PersonalNetwork data={initialPathData} />
      </div>

        <Sidetabs initialExpanded={initialExpanded} initialTab={initialTab} userEmail={userEmail}/>

    
    </div>
  );
}
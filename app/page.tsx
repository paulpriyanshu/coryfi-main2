import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { fetchUserData } from './api/actions/media';
import { fetchRequestsForIntermediary } from '@/app/api/actions/network';
import ClientComponent from '@/components/ui/sections/ClientComponent';

// Add SearchParams type for the page props
type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function ServerComponent({ searchParams }: PageProps) {
  // Get session on server side
  const session = await getServerSession();
  
  // Get initial data on server
  let userData = null;
  let collabData = null;
  let initialPathData = null;
  
  if (session?.user?.email) {
    // Fetch initial collab requests count
    collabData = await fetchRequestsForIntermediary(session.user.email);
    
  }

  // Get query parameters from searchParams prop
  const initialTab = searchParams.tab as string;
  const shouldExpand = searchParams.expand === 'true';
  const userId = searchParams.id as string;

  // Pass all server-fetched data to client component
  return (
    <ClientComponent 
      initialPathData={initialPathData}
      initialTab={initialTab}
      initialExpanded={shouldExpand}
      userEmail={session?.user?.email}
    />
  );
}

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServerComponent searchParams={searchParams} />
    </Suspense>
  );
}
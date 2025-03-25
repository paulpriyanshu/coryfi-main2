'use client'

import React from 'react'
import useSWR from 'swr'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { getUnconnectedUsers } from '@/app/api/actions/media'

// Define the type for user data
interface User {
  id: string;
  name: string;
  email: string;
  userdp?: string;
}

// Custom fetcher function using the server action
const fetcher = async (email: string) => {
  if (!email) return [];
  return await getUnconnectedUsers(email);
}

const CircularUserCarousel = ({ userEmail }: { userEmail: string }) => {
  // Embla Carousel setup with enhanced swipe settings
  const [emblaRef] = useEmblaCarousel({ 
    loop: false,
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1
  });
  
  // SWR hook for data fetching
  const { 
    data: users, 
    error, 
    isLoading 
  } = useSWR(userEmail ? `unconnected-users-${userEmail}` : null, () => fetcher(userEmail));

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden">
        <div className="flex gap-6 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-none">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="w-16 h-4 mt-2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center text-red-500 my-2">
        Failed to load users
      </div>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="text-center text-muted-foreground my-2">
        No users to display
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {users.map((user) => (
          <div key={user.id} className="flex-none min-w-0 px-4">
            <Link href={`/userProfile/${user.id}`}>
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-20 h-20 border-2 border-primary">
                  <AvatarImage src={user.userdp} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-center truncate max-w-[80px]">{user.name}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CircularUserCarousel;

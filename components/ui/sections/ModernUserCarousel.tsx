'use client'

import React, { useCallback } from 'react'
import useSWR from 'swr'
import useEmblaCarousel from 'embla-carousel-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  if (!email) return null;
  return await getUnconnectedUsers(email);
}

const ModernUserCarousel = ({ userEmail }: { userEmail: string }) => {
  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'start' 
  });

  // SWR hook for data fetching
  const { 
    data: users, 
    error, 
    isLoading 
  } = useSWR(userEmail ? `unconnected-users-${userEmail}` : null, () => fetcher(userEmail));

  const router = useRouter();

  // Scroll navigation callbacks
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Early return states
  if (!userEmail || isLoading) return null;
  if (error) return <div>Failed to load users</div>;
  if (!users || users.length === 0) return null;

  return (
    <div className="relative w-5/6 max-w-sm m-5">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {users?.map((user) => (
            <div key={user.id} className="flex-[0_0_100%] min-w-0 pl-4 relative">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.userdp} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-black">{user.name}</h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/userProfile/${user.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/users`)}
                    >
                      Show More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {users && users.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-md"
            onClick={scrollPrev}
            disabled={!emblaApi?.canScrollPrev()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-md"
            onClick={scrollNext}
            disabled={!emblaApi?.canScrollNext()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

export default ModernUserCarousel;
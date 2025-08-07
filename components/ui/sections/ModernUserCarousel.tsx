'use client'

import React, { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { getUnconnectedUsers } from '@/app/api/actions/media'
import { Loader2 } from 'lucide-react'

interface User {
  id: string;
  name: string;
  email: string;
  userdp?: string;
}

const USERS_PER_PAGE = 5;

const CircularUserCarousel = ({ userEmail }: { userEmail: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1
  });

  // Fetch users (initial + more)
  const fetchUsers = async (pageNum: number) => {
    if (!userEmail || !hasMore) return;

    if (pageNum === 1) {
      setInitialLoading(true);
    } else {
      setFetchingMore(true);
    }

    try {
      const newUsers = await getUnconnectedUsers(userEmail, pageNum, USERS_PER_PAGE);
      setUsers((prev) => [...prev, ...newUsers]);

      if (newUsers.length < USERS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load users", err);
      setHasMore(false);
    } finally {
      if (pageNum === 1) {
        setInitialLoading(false);
      } else {
        setFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [userEmail]);

  useEffect(() => {
    if (!emblaApi) return;

    const onScroll = () => {
      const scrollProgress = emblaApi.scrollProgress();
      if (scrollProgress >= 0.95 && hasMore && !fetchingMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchUsers(nextPage);
      }
    };

    emblaApi.on('scroll', onScroll);
    return () => emblaApi.off('scroll', onScroll);
  }, [emblaApi, page, hasMore, fetchingMore]);

  if (initialLoading) {
    return (
      <div className="w-full overflow-hidden">
        <div className="flex gap-6 px-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-none">
              <Skeleton className="w-20 h-20 rounded-full" />
              <Skeleton className="w-16 h-4 mt-2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center text-muted-foreground my-2">
        No users to display
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden" ref={emblaRef}>
      <div className="flex items-center">
        {users.map((user) => (
          <div key={user.id} className="flex-none min-w-0 px-4">
            <Link href={`/userProfile/${user.id}`}>
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-20 h-20 border-2 border-blue-400">
                  <AvatarImage src={user.userdp} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-center truncate max-w-[80px]">{user.name}</span>
              </div>
            </Link>
          </div>
        ))}

        {/* Loader at the end when fetching more */}
        {fetchingMore && (
          <div className="flex-none px-4 flex items-center justify-center">
            <div className="w-20 h-20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CircularUserCarousel;
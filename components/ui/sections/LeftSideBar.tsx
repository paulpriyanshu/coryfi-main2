'use client'

import React from "react"
import useSWR from 'swr'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getUnconnectedUsers } from "@/app/api/actions/media"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LeftSidebar({ userEmail }) {
  const router = useRouter()

  const { data: people, isLoading } = useSWR(
    userEmail ? ['unconnectedUsers', userEmail] : null,
    () => getUnconnectedUsers(userEmail),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );


  return (
    <Card className="bg-white shadow-lg sticky top-4">
      <CardContent className="p-6">
        <div className="flex justify-center h-full w-full font-bold text-slate-800 text-lg m-2">
          People You May Know
        </div>
        <div>
          <ScrollArea className="h-[calc(100vh-300px)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between mb-5 p-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                  <Skeleton className="h-8 w-[60px]" />
                </div>
              ))
            ) : (
              people?.map(person => (
                <div 
                  key={person?.name} 
                  className="flex items-center justify-between mb-5 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={person?.userdp} alt={person?.name} />
                      <AvatarFallback>{person?.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm text-black">{person?.name}</p>
                  </div>
                  <Link  href={`/userProfile/${person.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-black border-black hover:bg-slate-400"
                   
                  >
                    View 
                  </Button>
                  </Link>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
        <div className="flex justify-center m-2" onClick={() => router.push('/users')}>
          <Button>
            Show More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}